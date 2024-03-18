const Exchange = require("./Exchange");
const TaskManager = require("../utils/TaskManager");

class Coinbase extends Exchange {
  constructor() {
    super("Coinbase");
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
}

module.exports = Coinbase;
