from pathlib import Path
import json
import struct
import pandas
import numpy
import subprocess
import os

def find_minute_folders(hour_path: str) -> list:
    return sorted(Path(hour_path).glob("*"))

def load_all_files_in_folder(folder_path: str) -> list:
    return list(Path(folder_path).glob("*"))

def load_snapshots(filepath):
    snapshots = []
    with open(filepath, "rb") as f:
        while True:
            header = f.read(12)
            if len(header) < 12:
                break

            timestamp_ns, length = struct.unpack("<QI", header)
            json_bytes = f.read(length)
            message = json.loads(json_bytes.decode("utf-8"))
            message["timestamp_ns"] = timestamp_ns
            snapshots.append(message)
    return snapshots


def parse_metadata_from_path(filepath: str) -> dict:
    p = Path(filepath)
    return {
        "channel": p.parts[1],
        "exchange": p.parts[2],
        "market": p.parts[3],
        "symbol": p.parts[4],
        "date": p.parts[5],
        "hour": p.parts[6],
        "minute": p.parts[7],
    }


def normalize_orderbook(snap, levels=10):
    flat = {"timestamp": snap["timestamp_ns"]}
    for i in range(levels):
        flat[f"bid_price_L{i+1}"] = float(snap["bids"][i][0])
        flat[f"bid_volume_L{i+1}"] = float(snap["bids"][i][1])
        flat[f"ask_price_L{i+1}"] = float(snap["asks"][i][0])
        flat[f"ask_volume_L{i+1}"] = float(snap["asks"][i][1])

    return flat


def normalize_trades(snap):
    return {
        "eventTime": snap["eventTime"],
        "tradeId": snap["tradeId"],
        "price": float(snap["price"]),
        "quantity": float(snap["quantity"]),
        "tradeTime": snap["tradeTime"],
        "side": snap["isBuyerMaker"],
    }

def build_dataframe(filepath):
    meta = parse_metadata_from_path(filepath)
    raw = load_snapshots(filepath)

    if meta["channel"] == "orderbook":
        rows = [normalize_orderbook(s) for s in raw]
        df = pandas.DataFrame(rows)
        df["timestamp"] = pandas.to_datetime(df["timestamp"])

    elif meta["channel"] == "trades":
        rows = [normalize_trades(s) for s in raw]
        df = pandas.DataFrame(rows)
        df["timestamp"] = pandas.to_datetime(df["tradeTime"], unit="ms")
        
    else:
        raise ValueError(f"Unknown channel")
    
    for k, v in meta.items():
        if k == "hour":
            df[k] = numpy.int32(v) 
        else:
            df[k] = v
    return df

def write_parquet(df, output_root: str):
    channel = df["channel"].iloc[0]
    exchange = df["exchange"].iloc[0]
    market = df["market"].iloc[0]
    symbol = df["symbol"].iloc[0]
    date = df["date"].iloc[0]
    hour = df["hour"].iloc[0]

    output_path = f"{output_root}/channel={channel}/exchange={exchange}/market={market}/symbol={symbol}/date={date}/hour={hour}/"
    
    Path(output_path).mkdir(parents=True, exist_ok=True)

    filename = f"{symbol}-{date}-{hour}.parquet"
    full_path = output_path + filename

    df.to_parquet(full_path, index=False)
    print(f"Written: {full_path}")

def run_etl(path, output_root):
    all_rows = []
    for minute_folder in find_minute_folders(path):
        files = load_all_files_in_folder(minute_folder)
        for file_path in files:
            df = build_dataframe(file_path)
            all_rows.append(df)
    
    if all_rows:
        df_hour = pandas.concat(all_rows, ignore_index=True)
        write_parquet(df_hour, output_root)

def sync_s3(region: str, host: str, output_root: str ) -> None:
    os.environ["AWS_DEFAULT_REGION"] = region 

    command = [
        "aws",
        "s3",
        "sync",
        f"{output_root}",
        f"s3://{host}/output_parquet/",
        "--exact-timestamps",
    ]

    result = subprocess.run(command, capture_output=True, text=True)

    print("Output:", result.stdout)
    print("Errors:", result.stderr)
    
def clean_up(folder_path) -> None:
    try:
        os.system(f"rm -rf {folder_path}")
        print(f"Successfully deleted the folder: {folder_path}")
    except Exception as e:
        print(f"Error: {e}")
