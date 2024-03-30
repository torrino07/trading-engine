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
    let hasEwma = configs.some((config) => config.name === "ewma");

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
    return this.signalFunctions(data);
  }
}

module.exports = SignalFactory;
