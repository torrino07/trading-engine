const TaskManager = require("../utils/TaskManager");

class Binance {
  constructor() {
  }

  registerTask(task) {
    const handlers = {
      "binance.spot.depth": this.handleSpotDepth,
      "binance.spot.trades": this.handleSpotTrades,
      "binance.futures.depth": this.handleFuturesDepth,
      "binance.futures.trades": this.handleFuturesTrades,
      "binance.spot.depth.prices": this.handleSpotDepthPrices,
      "binance.futures.depth.prices": this.handleFuturesDepthPrices,
      "binance.spot.raw": this.handleSpotRaw,
      "binance.futures.raw": this.handleFuturesRaw
    }

    if (handlers[task]) {
      TaskManager.registerHandler(task, handlers[task].bind(this));
    } else {
      console.log(`Handler for ${task} not found.`);
    }
  }

  getHandler(task) {
    return TaskManager.getHandler(task);
  }

  handleSpotDepth(data) {
    const exchange = "binance";
    const market = "spot";
    const channel = "depth";
    const response = data.data;
    const streamArray = data.stream.split("@");
    const symbol = streamArray[0].toUpperCase();
    const asks = response.asks;
    const bids = response.bids;
    const timestamp = Date.now();

    return { exchange, market, channel, symbol, asks, bids, timestamp };
  }

  handleSpotTrades(data) {
    const exchange = "binance";
    const market = "spot";
    const channel = "trades";
    const response = data.data;
    const symbol = response.s;
    const price = response.p;
    const volume = response.q;
    const timestamp = Date.now();
    const isBuyerMaker = response.m;

    return { exchange, market, channel, symbol, price, volume, isBuyerMaker, timestamp };
  }

  handleFuturesDepth(data) {
    const exchange = "binance";
    const market = "futures";
    const channel = "depth";
    const response = data.data;
    const symbol = response.s;
    const asks = response.a;
    const bids = response.b;
    const timestamp = response.T;

    return { exchange, market, channel, symbol, asks, bids, timestamp };
  }

  handleFuturesTrades(data) {
    const exchange = "binance";
    const market = "futures";
    const channel = "trades";
    const response = data.data;
    const symbol = response.s;
    const price = response.p;
    const volume = response.q;
    const timestamp = response.T;
    const isBuyerMaker = response.m;

    return { exchange, market, channel, symbol, price, volume, isBuyerMaker, timestamp };
  }

  handleSpotRaw(data) {
    return data
  }

  handleFuturesRaw(data) {
    return data
  }

  handleSpotDepthPrices(data) {
    const spotDepthData = this.handleSpotDepth(data);
    const estimatorResults = this.prices.execute(spotDepthData);
    return { ...spotDepthData, ...estimatorResults };
  }

  handleFuturesDepthPrices(data) {
    const futuresDepthData = this.handleSpotDepth(data);
    const estimatorResults = this.prices.execute(futuresDepthData);
    return { ...futuresDepthData, ...estimatorResults };
  }
}

module.exports = Binance;
