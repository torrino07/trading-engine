const BigNumber = require("bignumber.js");

class EWMA {
  constructor(settings) {
    this.lambda = new BigNumber(settings.lambda);
    this.decimals = settings.decimals;
  }

  execute(data) {
    let ewma = new BigNumber(data[0]);

    for (let i = 1; i < data.length; i++) {
      let price = new BigNumber(data[i]);
      ewma = price
        .multipliedBy(this.lambda)
        .plus(ewma.multipliedBy(new BigNumber(1).minus(this.lambda)));
    }

    return ewma.toFixed(this.decimals);
  }
}

module.exports = EWMA;
