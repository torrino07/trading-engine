class ExchangeFactory {
  static createExchange(name) {
    switch (name) {
      case "binance":
        const Binance = require("./Binance");
        return new Binance();
      case "coinbase":
        const Coinbase = require("./Coinbase");
        return new Coinbase();
      default:
        throw new Error(`Exchange ${name} not supported`);
    }
  }
}

module.exports = ExchangeFactory;
