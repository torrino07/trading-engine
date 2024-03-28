class PriceEstimator {
  constructor(estimatorConfigs = []) {
    this.estimatorFunctions = this.composeEstimators(estimatorConfigs);
  }

  composeEstimators(estimatorConfigs) {
    // Helper function to get settings by name
    const getSettings = (name) => {
      return estimatorConfigs.find((config) => config.name === name)?.settings;
    };

    let hasMid = estimatorConfigs.some((config) => config.name === "mid");
    let hasVwap = estimatorConfigs.some((config) => config.name === "vwap");
    let hasSma = estimatorConfigs.some((config) => config.name === "sma");
    let hasReturns = estimatorConfigs.some(
      (config) => config.name === "returns"
    );
    let hasEwma = estimatorConfigs.some((config) => config.name === "ewma");

    if (hasMid && hasVwap) {
      return (data) =>
        this.applyMidVWAP(data, getSettings("mid"), getSettings("vwap"));
    }

    if (hasReturns && hasSma && hasEwma) {
      return (data) =>
        this.applyReturnsSMAEWMA(
          data,
          getSettings("returns"),
          getSettings("sma"),
          getSettings("ewma")
        );
    } else if (hasReturns && hasSma) {
      return (data) =>
        this.applyReturnsSMA(data, getSettings("returns"), getSettings("sma"));
    }

    if (hasMid && !hasVwap) {
      return (data) => this.applyMid(data, getSettings("mid"));
    }

    if (hasVwap && !hasMid) {
      return (data) => this.applyVWAP(data, getSettings("vwap"));
    }

    if (hasSma && !hasReturns && !hasEwma) {
      return (data) => this.applySMA(data, getSettings("sma"));
    }

    if (hasReturns && !hasSma && !hasEwma) {
      return (data) => this.applyReturns(data, getSettings("returns"));
    }

    if (hasEwma && !hasReturns && !hasSma) {
      return (data) => this.applyEWMA(data, getSettings("ewma"));
    }
  }

  applyMid(data, settings) {
    const Mid = require("./MidPrice");
    const mid = new Mid(settings);
    return { mid: mid.execute(data) };
  }

  applyVWAP(data, settings) {
    const VWAP = require("./VolumeWeightedAveragePrice");
    const vwap = new VWAP(settings);
    return { vwap: vwap.execute(data) };
  }

  applyMidVWAP(data, settingsMid, settingsVwap) {
    const midResult = this.applyMid(data, settingsMid);
    const vwapResult = this.applyVWAP(data, settingsVwap);
    return { ...midResult, ...vwapResult };
  }

  applySMA(data, settings) {
    const SMA = require("./SimpleMovingAverage");
    const sma = new SMA(settings);
    return { sma: sma.execute(data) };
  }

  applyReturns(data, settings) {
    const Returns = require("./Returns");
    const returns = new Returns(settings);
    return { returns: returns.execute(data) };
  }

  applyEWMA(data, settings) {
    const EWMA = require("./ExponentialWeightedMovingAverage");
    const ewma = new EWMA(settings);
    return { ewma: ewma.execute(data) };
  }

  applyReturnsSMA(data, settingsReturns, settingsSma) {
    const returnsResult = this.applyReturns(data, settingsReturns);
    const smaResult = this.applySMA(data, settingsSma);
    return { ...returnsResult, ...smaResult };
  }

  applyReturnsSMAEWMA(data, settingsReturns, settingsSma, settingsEwma) {
    const returnsResult = this.applyReturns(data, settingsReturns);
    const smaResult = this.applySMA(data, settingsSma);
    const ewmaResult = this.applyEWMA(data, settingsEwma);
    return { ...returnsResult, ...smaResult, ...ewmaResult };
  }

  execute(data) {
    return this.estimatorFunctions(data);
  }
}

module.exports = PriceEstimator;
