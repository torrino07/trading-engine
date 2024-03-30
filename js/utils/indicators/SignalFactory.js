class SignalFactory {
  constructor(configs = []) {
    this.signalFunctions = this.composeSignals(configs);
  }

  composeSignals(configs) {
    const getSettings = (name) => {
      return configs.find((config) => config.name === name)?.settings;
    };

    let hasSma = configs.some((config) => config.name === "sma");
    let hasReturns = configs.some(
      (config) => config.name === "returns"
    );
    let hasEwmaSlow = configs.some((config) => config.name === "ewma-slow");
    let hasEwmaFast = configs.some((config) => config.name === "ewma-fast");

    if (hasReturns && hasSma && hasEwmaSlow && hasEwmaFast) {
      return (data) =>
        this.applyReturnsSMAEWMA(
          data,
          getSettings("returns"),
          getSettings("sma"),
          getSettings("ewma-slow"),
          getSettings("ewma-fast")
        );
    } else if (hasReturns && hasSma) {
      return (data) =>
        this.applyReturnsSMA(data, getSettings("returns"), getSettings("sma"));
    }

    if (hasSma && !hasReturns && !hasEwmaSlow && !hasEwmaFast) {
      return (data) => this.applySMA(data, getSettings("sma"));
    }

    if (hasReturns && !hasSma && !hasEwmaSlow && !hasEwmaFast) {
      return (data) => this.applyReturns(data, getSettings("returns"));
    }

    if (hasEwmaSlow && hasEwmaFast && !hasReturns && !hasSma) {
      return (data) => this.applyEWMA(data, getSettings("ewma-slow"), getSettings("ewma-fast"));
    }
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

  applyEWMA(data, settingsEwmaSlow, settingsEwmaFast) {
    const EWMA = require("./ExponentialWeightedMovingAverage");
    const ewmaSlow = new EWMA(settingsEwmaSlow);
    const ewmaFast = new EWMA(settingsEwmaFast);
    return { "ewma-slow": ewmaSlow.execute(data), "ewma-fast": ewmaFast.execute(data),};
  }

  applyReturnsSMA(data, settingsReturns, settingsSma) {
    const returnsResult = this.applyReturns(data, settingsReturns);
    const smaResult = this.applySMA(data, settingsSma);
    return { ...returnsResult, ...smaResult };
  }

  applyReturnsSMAEWMA(data, settingsReturns, settingsSma, settingsEwmaSlow, settingsEwmaFast) {
    const returnsResult = this.applyReturns(data, settingsReturns);
    const smaResult = this.applySMA(data, settingsSma);
    const ewmaResult = this.applyEWMA(data, settingsEwmaSlow, settingsEwmaFast);
    return { ...returnsResult, ...smaResult, ...ewmaResult};
  }

  execute(data) {
    return this.signalFunctions(data);
  }
}

module.exports = SignalFactory;
