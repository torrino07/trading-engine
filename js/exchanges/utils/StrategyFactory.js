const MarketMaker = require("./MarketMaker");
const TriangularArbitrage = require("./TriangularArbitrage");

class StrategyFactory {
  static createStrategy(config) {
    switch (config.strategy) {
      case "market_maker":
        return new MarketMaker(config);
      case "triangular_arbitrage":
        return new TriangularArbitrage();
      default:
        throw new Error("Invalid strategy type");
    }
  }
}

module.exports = StrategyFactory;