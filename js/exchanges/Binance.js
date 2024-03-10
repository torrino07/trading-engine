const Exchange = require("./Exchange");
const TaskManager = require("./utils/TaskManager");

class Binance extends Exchange {
  constructor() {
    super("Binance");
  }

  registerTaskHandlers() {
    const tasks = [
      {
        identifier: "binance.spot.depth",
        handler: this.handleSpotDepth.bind(this),
      },
      {
        identifier: "binance.spot.trades",
        handler: this.handleSpotTrades.bind(this),
      },
      {
        identifier: "binance.futures.depth",
        handler: this.handleFuturesDepth.bind(this),
      },
      {
        identifier: "binance.futures.trades",
        handler: this.handleFuturesTrades.bind(this),
      },
    ];

    tasks.forEach(({ identifier, handler }) =>
      TaskManager.registerHandler(identifier, handler)
    );
  }

  handleSpotDepth(data) {
    const response = data.data;
    const streamArray = data.stream.split("@");
    const symbol = streamArray[0].toUpperCase()
    const asks = response.asks.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
    const bids = response.bids.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
    const timestamp = Date.now();

    return { symbol, asks, bids, timestamp};
  }

  handleSpotTrades(data) {
  }

  handleFuturesDepth(data) {
    // Logic for handling spot depth data
  }

  handleFuturesTrades(data) {
    // Logic for handling futures depth data
  }
}

module.exports = Binance;
