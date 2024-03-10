const PriceStrategyFactory = require("./PriceStrategiesFactory");
const MetricsFactory = require("./MetricsFactory");

class MarketMaker {
  constructor(config) {
    this.priceStrategy = PriceStrategyFactory.createPriceStrategy(config);
    this.metric = MetricsFactory.createMetric(config);
  }

  execute(data) {
    // Implement market making logic using the calculated price
    console.log(`Market Maker Strategy`);
    console.log(data)
  }
}

module.exports = MarketMaker;
