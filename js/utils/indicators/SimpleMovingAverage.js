const BigNumber = require("bignumber.js");

class SMA {
  constructor(settings) {
    this.decimals = settings.decimals;
  }
  execute(data) {
    console.log(data)
    const sum = data.reduce(
      (acc, number) => acc.plus(new BigNumber(number)),
      new BigNumber(0)
    );
    const sma = sum.dividedBy(data.length);
    return sma.toFixed(this.decimals);
  }
}

module.exports = SMA;
