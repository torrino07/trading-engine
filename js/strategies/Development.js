const MarketPriceFactory = require("../utils/indicators/MarketPriceFactory");
const IndicatorsFactory = require("../utils/indicators/IndicatorsFactory");

class Development {
  constructor(config) {
    this.name = "Development";
    this.message = new String();
  }
  
  run(data) {
    console.log(data);
  }
}

module.exports = Development;
