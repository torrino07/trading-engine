const MarketPriceFactory = require("../utils/indicators/MarketPriceFactory");
const IndicatorsFactory = require("../utils/indicators/IndicatorsFactory");

class AvellanedaStoikov {
  constructor(config) {
    this.name = "AvellanedaStoikov";
    this.message = new String();
  }

  run(data) {
    const { exchange, market, channel, symbol } = data;
  }
}

module.exports = AvellanedaStoikov;
