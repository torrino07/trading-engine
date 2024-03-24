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
        case "mean":
          return (data) => this.applyMean(data, config.settings);
        case "returns":
          return (data) => this.applyReturns(data, config.settings);
        default:
          throw new Error(`Unsupported estimator: ${config.name}`);
      }
    });
    return estimatorFunctions.reduce((acc, current) => {
      return (data) => current(acc(data));
    });
  }

  applyMid(data, settings) {
    const Mid = require("./MidPrice");
    const mid = new Mid(settings);
    const midResult = mid.execute(data);
    return { ...data, ...{ mid: midResult } };
  }

  applyVWAP(data, settings) {
    const VWAP = require("./VolumeWeightedAveragePrice");
    const vwap = new VWAP(settings);
    const vwapResult = vwap.execute(data);
    return { ...data, ...{ vwap: vwapResult } };
  }

  applyMean(data, settings) {
    const Mean = require("./Mean");
    const mean = new Mean(settings);
    const meanResult = mean.execute(data);
    return { ...data, ...{ mean: meanResult } };
  }

  applyReturns(data, settings) {
    const Returns = require("./Returns");
    const returns = new Returns(settings);
    const returnsResult = returns.execute(data);
    return { returns: returnsResult };

  }

  execute(data) {
    return this.applyEstimators(data);
  }
}

module.exports = PriceEstimator;
