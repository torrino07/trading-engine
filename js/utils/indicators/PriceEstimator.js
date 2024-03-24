// class PriceEstimator {
//   constructor(estimatorConfigs) {
//     this.estimatorFunctions = this.composeEstimators(estimatorConfigs);
//   }

//   composeEstimators(estimatorConfigs) {
//     return estimatorConfigs.map((config) => {
//       return (data) => {
//         switch (config.name) {
//           case "mid":
//             return this.applyMid(data, config.settings);
//           case "vwap":
//             return this.applyVWAP(data, config.settings);
//           case "mean":
//             return this.applyMean(data, config.settings);
//           case "returns":
//             return this.applyReturns(data, config.settings);
//           default:
//             throw new Error(`Unsupported estimator: ${config.name}`);
//         }
//       };
//     });
//   }

//   applyMid(data, settings) {
//     const Mid = require("./MidPrice");
//     const mid = new Mid(settings);
//     const midResult = mid.execute(data);
//     return { mid: midResult };
//   }

//   applyVWAP(data, settings) {
//     const VWAP = require("./VolumeWeightedAveragePrice");
//     const vwap = new VWAP(settings);
//     return { vwap: vwap.execute(data) };
//   }

//   applyMean(data, settings) {
//     const Mean = require("./Mean");
//     const mean = new Mean(settings);
//     return { mean: mean.execute(data) };
//   }

//   applyReturns(data, settings) {
//     const Returns = require("./Returns");
//     const returns = new Returns(settings);
//     return { returns: returns.execute(data) };
//   }

//   execute(data) {
//     const estimatorResults = this.estimatorFunctions.reduce(
//       (acc, estimatorFunction) => {
//         const result = estimatorFunction(data);
//         return { ...acc, ...result };
//       },
//       {}
//     );
//     return estimatorResults;
//   }
// }

// module.exports = PriceEstimator;

class PriceEstimator {
  constructor(estimatorConfigs = []) {
    this.estimatorFunctions = Array.isArray(estimatorConfigs)
      ? this.composeEstimators(estimatorConfigs)
      : [];
  }

  composeEstimators(estimatorConfigs) {
    return estimatorConfigs.map((config) => {
      return (data) => {
        switch (config.name) {
          case "mid":
            return this.applyMid(data, config.settings);
          case "vwap":
            return this.applyVWAP(data, config.settings);
          case "mean":
            return this.applyMean(data, config.settings);
          case "returns":
            return this.applyReturns(data, config.settings);
          default:
            console.warn(`Unsupported estimator: ${config.name}`);
            return {};
        }
      };
    });
  }

  applyMid(data, settings) {
    const Mid = require("./MidPrice");
    const mid = new Mid(settings);
    const midResult = mid.execute(data);
    return { mid: midResult };
  }

  applyVWAP(data, settings) {
    const VWAP = require("./VolumeWeightedAveragePrice");
    const vwap = new VWAP(settings);
    return { vwap: vwap.execute(data) };
  }

  applyMean(data, settings) {
    const Mean = require("./Mean");
    const mean = new Mean(settings);
    return { mean: mean.execute(data) };
  }

  applyReturns(data, settings) {
    const Returns = require("./Returns");
    const returns = new Returns(settings);
    return { returns: returns.execute(data) };
  }

  execute(data) {
    const estimatorResults =
      this.estimatorFunctions.length > 0
        ? this.estimatorFunctions.reduce((acc, func) => {
            const result = func(data);
            return { ...acc, ...result };
          }, {})
        : {};

    return estimatorResults;
  }
}

module.exports = PriceEstimator;
