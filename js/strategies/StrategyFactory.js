class StrategyFactory {
  static createStrategy(config) {
    switch (config.strategy) {
      case "avellaneda_stoikov":
        const AvellanedaStoikov = require("./AvellanedaStoikov");
        return new AvellanedaStoikov(config);
      case "triangular_arbitrage":
        const TriangularArbitrage = require("./TriangularArbitrage");
        return new TriangularArbitrage(config);
      case "dev":
        const Development = require("./Development");
        return new Development(config);
      default:
        throw new Error("Invalid strategy");
    }
  }
};

module.exports = StrategyFactory;
