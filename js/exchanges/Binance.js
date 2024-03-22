const TaskManager = require("../utils/TaskManager");

class Binance {
  constructor() {
    this.registerTask();
  }

  registerTask() {
    TaskManager.registerHandler(
      "binance.spot.depth",
      this.handleSpotDepth.bind(this)
    );
    TaskManager.registerHandler(
      "binance.spot.trades",
      this.handleSpotTrades.bind(this)
    );
    TaskManager.registerHandler(
      "binance.futures.depth",
      this.handleFuturesDepth.bind(this)
    );
    TaskManager.registerHandler(
      "binance.futures.trades",
      this.handleFuturesTrades.bind(this)
    );
  }

  getHandler(taskIdentifier) {
    return TaskManager.getHandler(taskIdentifier);
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
    const timestamp = response.T;

    return { exchange, market, channel, symbol, price, volume, timestamp };
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

    return { exchange, market, channel, symbol, price, volume, timestamp };
  }
}

module.exports = Binance;
