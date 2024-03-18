class MarketPriceFactory {
  static createPriceStrategy(strategy) {
    switch (strategy) {
      case "mid":
        const { Mid } = require("./MidPrice");
        return new Mid();
      case "vwap":
        const { VWAP } = require("./VolumeWeightedAveragePrice");
        return new VWAP();
      default:
        throw new Error("Invalid price strategy");
    }
  }
}

module.exports = MarketPriceFactory;
