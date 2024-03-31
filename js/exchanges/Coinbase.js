const TaskManager = require("../utils/TaskManager");

class Coinbase {
  constructor() {
  }

  registerTask(task) {
    const handlers = {
      "coinbase.spot.depth": this.handleSpotDepth,
      "coinbase.spot.trades": this.handleSpotTrades,
      "coinbase.futures.depth": this.handleFuturesDepth,
      "coinbase.futures.trades": this.handleFuturesTrades,
      "coinbase.spot.depth.prices": this.handleSpotDepthPrices,
      "coinbase.futures.depth.prices": this.handleFuturesDepthPrices
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
