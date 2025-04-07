from pathlib import Path
import os
import shutil
import subprocess

AWS_REGION="us-east-1"
S3_PATH="marketdata001-dev/binlogs"

def aws_sync_s3(directory):
    os.environ["AWS_DEFAULT_REGION"] = AWS_REGION
    result = subprocess.run(["aws", "s3", "sync", directory, "s3://" + S3_PATH, "--exact-timestamps"], capture_output=True, text=True)
    print("Sync successful" if result.returncode == 0 else f"Sync failed\n{result.stderr}")

def filter_files(directory):
    biggest_hour, biggest_minute = -1, -1
    
    array = []
    for root, dirs, files in os.walk(directory):
        path_parts = root.split("/")
        if len(path_parts) >= 9:
            array.append(path_parts[-1])
            try:
                hour, minute = int(path_parts[-2]), int(path_parts[-1])
                if hour > biggest_hour or (hour == biggest_hour and minute > biggest_minute):
                    biggest_hour, biggest_minute = hour, minute
            except ValueError:
                continue
    
    minute_count = len(sorted(set(array)))
    if minute_count > 2:
        files = sorted(list(map(str, Path(directory).rglob("*.binlog"))))
        return [f for f in files if f"{biggest_hour}/{biggest_minute}" not in f]
    else:
        return None

# 1. Filter Files
filtered_files = filter_files("./binlogs")

# 2. Move to staging dir
if filtered_files != None:
    for file in filtered_files:
        dest_path = os.path.join("staging", os.path.relpath(file, "binlogs"))
        dest_dir = os.path.dirname(dest_path)
        os.makedirs(dest_dir, exist_ok=True)
        shutil.move(file, dest_path)

# 3. Sync with AWS S3
    aws_sync_s3("./staging")
