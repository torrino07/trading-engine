const { Mid, VWAP } = require("./PriceStrategies");

class PriceStrategyFactory {
  static createPriceStrategy(strategy) {
    switch (strategy) {
      case "mid":
        return new Mid();
      case "vwap":
        return new VWAP();
      default:
        throw new Error("Invalid price strategy");
    }
  }
}

module.exports = PriceStrategyFactory;
