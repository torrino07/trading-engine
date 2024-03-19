const MarketPriceFactory = require("../utils/indicators/MarketPriceFactory");
const IndicatorsFactory = require("../utils/indicators/IndicatorsFactory");

class Indicators {
  constructor(config) {
    this.name = "Indicators";
    this.message = new String();
    this.mid = MarketPriceFactory.createPriceStrategy("mid");
    this.vwap = MarketPriceFactory.createPriceStrategy("vwap");

    this.ewma_mid = IndicatorsFactory.createMetric("ewma");
    this.ewma_vwap = IndicatorsFactory.createMetric("ewma");

    this.depth = parseFloat(config.depth);
    this.lambda = parseFloat(config.lambda);
    this.steps = parseFloat(config.steps);
    this.size = parseFloat(config.size);
  }

  run(data) {
    const { exchange, market, channel, symbol } = data;

    // const mid = this.mid.calculate(data, this.steps);
    // const vwap = this.vwap.calculate(data, this.steps, this.depth);

    // const ewma_mid = this.ewma_mid.calculate(mid, this.lambda, this.steps);
    // const ewma_vwap = this.ewma_vwap.calculate(vwap, this.lambda, this.steps);

    console.log(data)
  }
}

module.exports = Indicators;
