const { EWMA } = require("./Metrics");

class MetricsFactory {
  static createMetric(config) {
    switch (config.metric) {
      case "ewma":
        return new EWMA();
      default:
        throw new Error("Invalid price calculator type");
    }
  }
}

module.exports = MetricsFactory;
