const Exchange = require("./Exchange");
const TaskManager = require("./utils/TaskManager");

class Coinbase extends Exchange {
  constructor() {
    super("Coinbase");
  }

  registerTaskHandlers() {
    const tasks = [
      {
        identifier: "coinbase.spot.depth",
        handler: this.handleSpotDepth.bind(this),
      },
      {
        identifier: "coinbase.spot.trades",
        handler: this.handleSpotTrades.bind(this),
      },
      {
        identifier: "coinbase.futures.depth",
        handler: this.handleFuturesDepth.bind(this),
      },
      {
        identifier: "coinbase.futures.trades",
        handler: this.handleFuturesTrades.bind(this),
      },
    ];

    tasks.forEach(({ identifier, handler }) =>
      TaskManager.registerHandler(identifier, handler)
    );
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
