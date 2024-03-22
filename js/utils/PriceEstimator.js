class PriceEstimator {
  constructor(estimatorConfigs) {
    this.applyEstimators = this.composeEstimators(estimatorConfigs);
  }

  composeEstimators(estimatorConfigs) {
    if (!estimatorConfigs || estimatorConfigs.length === 0) {
      return (data) => data;
    }

    const estimatorFunctions = estimatorConfigs.map((config) => {
      switch (config.name) {
        case "mid":
          return (data) => this.applyMid(data, config.settings);
        case "vwap":
          return (data) => this.applyVWAP(data, config.settings);
        default:
          throw new Error(`Unsupported estimator: ${config.name}`);
      }
    });
    return estimatorFunctions.reduce((acc, current) => {
      return (data) => current(acc(data));
    });
  }

  applyMid(data, settings) {
    const Mid = require("./indicators/MidPrice");
    const mid = new Mid(settings);
    const midResult = mid.execute(data);
    console.log(midResult);
    return { ...data, ...{ mid: midResult } };
  }

  applyVWAP(data, settings) {
    const VWAP = require("./indicators/VolumeWeightedAveragePrice");
    const vwap = new VWAP(settings);
    const vwapResult = vwap.execute(data);
    return { ...data, ...{ vwap: vwapResult } };
  }

  execute(data) {
    return this.applyEstimators(data);
  }
}

module.exports = PriceEstimator;
