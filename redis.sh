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
node MarketDataHandling.js exchange=binance market=spot in=depth out=book

node MarketDataHandling.js exchange=binance market=spot in=trades out=executions

node MarketDataHandling.js exchange=binance market=futures in=depth out=book

node MarketDataHandling.js exchange=binance market=futures in=trades out=executions

############# Trading Logic #############
node TradingLogic.js exchanges=binance markets=spot in=book strategy=MarketMaker

node TradingLogic.js exchanges=binance markets=spot in=book strategy=TriangularArbitrage