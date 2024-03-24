const BigNumber = require("bignumber.js");

class Returns {
  constructor(settings) {
    this.decimals = settings.decimals;
  }
  execute(data) {
    const firstValue = new BigNumber(data[0]);
    const lastValue = new BigNumber(data.at(-1));
    const change = lastValue.minus(firstValue);
    const percentageChange = change.dividedBy(firstValue).multipliedBy(100);
    return percentageChange.toFixed(this.decimals);
  }
}

module.exports = Returns;
