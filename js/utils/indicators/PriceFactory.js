class PriceFactory {
  constructor(configs = []) {
    this.priceFunctions = this.composePrices(configs);
  }

  composePrices(configs) {
    const getSettings = (name) => {
      return configs.find((config) => config.name === name)?.settings;
    };

    let hasMid = configs.some((config) => config.name === "mid");
    let hasVwap = configs.some((config) => config.name === "vwap");

    if (hasMid && hasVwap) {
      return (data) =>
        this.applyMidVWAP(data, getSettings("mid"), getSettings("vwap"));
    }

    if (hasMid && !hasVwap) {
      return (data) => this.applyMid(data, getSettings("mid"));
    }

    if (hasVwap && !hasMid) {
      return (data) => this.applyVWAP(data, getSettings("vwap"));
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

  execute(data) {
    return this.priceFunctions(data);
  }
}

module.exports = PriceFactory;
