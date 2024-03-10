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
    const exchange = "binance";
    const market = "spot";
    const channel = "depth";
    const response = data.data;
    const streamArray = data.stream.split("@");
    const symbol = streamArray[0].toUpperCase();
    const asks = response.asks.sort(
      (a, b) => parseFloat(b[0]) - parseFloat(a[0])
    );
    const bids = response.bids.sort(
      (a, b) => parseFloat(b[0]) - parseFloat(a[0])
    );
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
    const asks = response.a.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
    const bids = response.b.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
    const timestamp = response.T;
    console.log(response);

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
