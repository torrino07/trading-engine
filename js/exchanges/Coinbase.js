const TaskManager = require("../utils/TaskManager");

class Coinbase {
  constructor() {
    this.registerTask();
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
      "coinbase.spot.depth.estimators",
      this.handleSpotDepthEstimators.bind(this)
    );
    TaskManager.registerHandler(
      "coinbase.futures.depth.estimators",
      this.handleFuturesDepthEstimators.bind(this)
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

  handleSpotDepthEstimators(data) {
    const spotDepthData = this.handleSpotDepth(data);
    const estimatorResults = this.estimators.execute(spotDepthData);
    return { ...spotDepthData, ...estimatorResults };
  }

  handleFuturesDepthEstimators(data) {
    const futuresDepthData = this.handleSpotDepth(data);
    const estimatorResults = this.estimators.execute(futuresDepthData);
    return { ...futuresDepthData, ...estimatorResults };
  }
}

module.exports = Coinbase;
