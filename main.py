from etl import run_etl

orderbook_hour_path = "marketdata/orderbook/binance/spot/BTCUSDT/2025-04-04/21"
trades_hour_path = "marketdata/trades/binance/spot/BTCUSDT/2025-04-04/21"


run_etl(path=orderbook_hour_path, output_root="output_parquet")
run_etl(path=trades_hour_path , output_root="output_parquet")