const BigNumber = require("bignumber.js");

class EWMA {
  constructor() {
    this.previousEWMA = null;
  }

  calculate(newPrice, lambda, decimals) {
    newPrice = new BigNumber(newPrice);
    lambda = new BigNumber(lambda);
    
    if (this.previousEWMA === null) {
      this.previousEWMA = newPrice;
    } else {
      this.previousEWMA = lambda.times(newPrice).plus(new BigNumber(1).minus(lambda).times(this.previousEWMA));
    }
    return this.previousEWMA.toFixed(decimals);
  }
}

module.exports = EWMA;
