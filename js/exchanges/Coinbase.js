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

  handleSpotDepth(data) {}

  handleSpotTrades(data) {}

  handleFuturesDepth(data) {
    // Logic for handling spot depth data
  }

  handleFuturesTrades(data) {
    // Logic for handling futures depth data
  }
}

module.exports = Coinbase;
