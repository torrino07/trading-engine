const StatisticalArbitrage = require("./StatisticalArbitrage");
const AvellanedaStoikov = require("./AvellanedaStoikov");
const TriangularArbitrage = require("./TriangularArbitrage");

class StrategyFactory {
  static createStrategy(config) {
    switch (config.strategy) {
      case "statistical_arbitrage":
        return new StatisticalArbitrage(config);
      case "avellaneda_stoikov":
        return new AvellanedaStoikov(config);
      case "triangular_arbitrage":
        return new TriangularArbitrage(config);
      default:
        throw new Error("Invalid strategy");
    }
  }
}

module.exports = StrategyFactory;