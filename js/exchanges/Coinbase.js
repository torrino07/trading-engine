const TaskManager = require("../utils/TaskManager");

class Coinbase {
  constructor() {
  }

  registerTask() {
    TaskManager.registerHandler(
      "coinbase.spot.depth",
      this.handleSpotDepth.bind(this)
    );
    TaskManager.registerHandler(
      "coinbase.spot.trades",
      this.handleSpotTrades.bind(this)
    );
    TaskManager.registerHandler(
      "coinbase.futures.depth",
      this.handleFuturesDepth.bind(this)
    );
    TaskManager.registerHandler(
      "coinbase.futures.trades",
      this.handleFuturesTrades.bind(this)
    );
    TaskManager.registerHandler(
      "coinbase.spot.depth.prices",
      this.handleSpotDepthPrices.bind(this)
    );
    TaskManager.registerHandler(
      "coinbase.futures.depth.prices",
      this.handleFuturesDepthPrices.bind(this)
    );
  }

  getHandler(taskIdentifier) {
    return TaskManager.getHandler(taskIdentifier);
  }

  handleSpotDepth(data) {
    return data;
  }

  handleSpotTrades(data) {
    return data;
  }

  handleFuturesDepth(data) {
    return data;
  }

  handleFuturesTrades(data) {
    return data;
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

module.exports = Coinbase;
