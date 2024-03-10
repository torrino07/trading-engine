const PriceStrategyFactory = require("./PriceStrategiesFactory");
const MetricsFactory = require("./MetricsFactory");

class MarketMaker {
  constructor(config) {
    this.mid = PriceStrategyFactory.createPriceStrategy("mid");
    this.vwap = PriceStrategyFactory.createPriceStrategy("vwap");
    this.ewma_mid = MetricsFactory.createMetric("ewma");
    this.ewma_vwap = MetricsFactory.createMetric("ewma");
    this.lambda = config.lambda
    this.steps = 2;
    this.size = 2;
  }

  execute(data) {

    const { exchange, market, channel, symbol } = data;

    if (channel === "depth") {
      const mid = this.mid.calculate(data, this.steps);
      const vwap = this.vwap.calculate(data, this.steps);
      const ewma_mid = this.ewma_mid.calculate(mid, this.lambda, this.steps);
      const ewma_vwap = this.ewma_vwap.calculate(vwap, this.lambda, this.steps);

      console.log("EWMA:", { exchange, market, channel, symbol, mid, vwap, ewma_mid, ewma_vwap});

    } else if (channel === "trades") {
 
    } else {
      console.log(
        `Unhandled data type for ${exchange} ${market} ${symbol}:`,
        data
      );
    }
  }
}

module.exports = MarketMaker;
