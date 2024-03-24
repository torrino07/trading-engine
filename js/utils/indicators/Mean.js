const BigNumber = require("bignumber.js");

class Mean {
  constructor(settings) {
    this.decimals = settings.decimals;
  }
  execute(data) {
    console.log(data)
    const sum = data.reduce(
      (acc, number) => acc.plus(new BigNumber(number)),
      new BigNumber(0)
    );
    const mean = sum.dividedBy(data.length);
    return mean.toFixed(this.decimals);
  }
}

module.exports = Mean;
