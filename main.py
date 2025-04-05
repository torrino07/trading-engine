from etl import run_etl, sync_s3, clean_up

region = "us-east-1"
host = "marketdata001-dev"
output_root = "output_parquet"
orderbook_hour_path = "marketdata/orderbook/binance/spot/BTCUSDT/2025-04-04/21"
trades_hour_path = "marketdata/trades/binance/spot/BTCUSDT/2025-04-04/21"

run_etl(path=orderbook_hour_path, output_root=output_root)
run_etl(path=trades_hour_path, output_root=output_root)

sync_s3(region=region, host=host, output_root=output_root)

clean_up(folder_path=output_root)
