#!/bin/bash

# Define the payload
topic="market.data.handling."
exchange="binance"
market="spot"
channel="depth"
task="metrics"

# Construct the JSON string with the variables
payload="{\"exchange\":\"$exchange\", \"market\":\"$market\", \"channel\":\"$channel\", \"task\":\"$task\", \"param\":$param}"

# Publish the JSON string to the Redis channel
redis-cli PUBLISH "$topic" "$payload"

############# 1. Market Data Handling #############
node MarketDataHandling.js exchange=binance source=binance.spot.depth destination=binance.spot.depth.stream settings=noOp

node MarketDataHandling.js exchange=binance source=binance.spot.trades destination=binance.spot.trades.stream

node MarketDataHandling.js exchange=binance source=binance.futures.depth destination=binance.futures.depth.stream

node MarketDataHandling.js exchange=binance source=binance.futures.trades destination=binance.futures.trades.stream

############# 2. Data Preprocessing #############
node DataPreprocessing.js source=binance.spot.depth.stream destination=indicators depth=3 lambda=0.94 steps=2 size=2

node DataPreprocessing.js source=binance.futures.depth.stream destination=indicators depth=3 lambda=0.94 steps=2 size=2

############# 3. Trading Logic #############
node TradingLogic.js exchange=binance source="spot.trades;futures.trades;indicators" destination=feedback strategy=dev

# node TradingLogic.js exchange=coinbase source=aggregates destination=feedback strategy=statistical_arbitrage depth=3 lambda=0.94 steps=2 size=2

# node TradingLogic.js exchange=coinbase source=aggregates destination=feedback strategy=avellaneda_stoikov

# node TradingLogic.js exchange=binance source=network destination=feedback strategy=triangular_arbitrage


## YOU CAN SUBSCRIBE TO MULTIPLE CHANNELS IN REDIS! SUBSCRIBE TO MULTIPLE SOURCE CHANNELS AND ONE DESTINATION FOR FEEDBACK

## 1. STANDARDIZE DATA
## 2. CALCULATE STATISTICS (INDICATORS)
## 3. MAKE TRADING