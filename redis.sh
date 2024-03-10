#!/bin/bash

# Define the payload
topic="market.data.handling."
exchange="binance"
market="spot"
channel="depth"
task="metrics"
param="{\"depth\":\"10\", \"priceEstimator\":\"mid\", \"metric\":\"ewma\"}"

# Construct the JSON string with the variables
payload="{\"exchange\":\"$exchange\", \"market\":\"$market\", \"channel\":\"$channel\", \"task\":\"$task\", \"param\":$param}"

# Publish the JSON string to the Redis channel
redis-cli PUBLISH "$topic" "$payload"

############# Market Data Handling #############
node MarketDataHandling.js exchange=binance source=binance.spot.depth destination=market_maker

node MarketDataHandling.js exchange=binance source=binance.spot.trades destination=market_maker

node MarketDataHandling.js exchange=binance source=binance.futures.depth destination=market_maker

node MarketDataHandling.js exchange=binance source=binance.futures.trades destination=market_maker

node MarketDataHandling.js exchange=binance source=binance.spot.depth destination=triangul_arbitrage

############# Trading Logic #############
node TradingLogic.js source=market_maker strategy=market_maker depth=5 

node TradingLogic.js source=triangul_arbitrage strategy=triangul_arbitrage