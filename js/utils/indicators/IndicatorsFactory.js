class IndicatorsFactory {
  static createMetric(metric) {
    switch (metric) {
      case "ewma":
        const { EWMA } = require("./ExponentialWeightedMovingAverage");
        return new EWMA();
      default:
        throw new Error("Invalid price calculator type");
    }
  }
}

module.exports = IndicatorsFactory;
