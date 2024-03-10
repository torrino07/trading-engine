const PriceStrategyFactory = require("./PriceStrategiesFactory");
const MetricsFactory = require("./MetricsFactory");

class MarketMaker {
  constructor(config) {
    // this.mid = PriceStrategyFactory.createPriceStrategy("mid");
    // this.vwap = PriceStrategyFactory.createPriceStrategy("vwap");
    // this.ewma_mid = MetricsFactory.createMetric("ewma");
    // this.ewma_vwap = MetricsFactory.createMetric("ewma");
    // this.lambda = config.lambda
  }

  execute(data) {
    return data

    // if (channel === "depth") {
    //   const mid = this.mid.calculate(data);
    //   const vwap = this.vwap.calculate(data);
    //   const ewma_mid = this.ewma_mid.calculate(mid, this.lambda);
    //   const ewma_vwap  = this.ewma_vwap.calculate(vwap, this.lambda);

    //   console.log("EWMA:", { exchange, market, channel, symbol, mid, ewma_mid, vwap, ewma_vwap});

    // } else if (channel === "trades") {
 
    // } else {
    //   console.log(
    //     `Unhandled data type for ${exchange} ${market} ${symbol}:`,
    //     data
    //   );
    // }
  }
}

module.exports = MarketMaker;
