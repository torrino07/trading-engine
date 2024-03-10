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

############# Market Data Handling #############
node MarketDataHandling.js exchange=binance source=binance.spot.depth destination=aggregates

node MarketDataHandling.js exchange=binance source=binance.spot.trades destination=aggregates

node MarketDataHandling.js exchange=binance source=binance.futures.depth destination=aggregates

node MarketDataHandling.js exchange=binance source=binance.futures.trades destination=aggregates

node MarketDataHandling.js exchange=binance source=binance.spot.depth destination=tri_arb

############# Trading Logic #############
node TradingLogic.js exchange=coinbase source=aggregates destination=fast_api strategy=statistical_arbitrage depth=3 lambda=0.94 steps=2 size=2

node TradingLogic.js exchange=coinbase source=aggregates destination=fast_api strategy=avellaneda_stoikov

node TradingLogic.js exchange=binance source=tri_arb destination=fast_api strategy=triangular_arbitrage