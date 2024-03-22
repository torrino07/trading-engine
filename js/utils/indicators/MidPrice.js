const BigNumber = require("bignumber.js");

class Mid {
  constructor(settings) {
    this.decimals = settings.decimals;
    this.index = settings.index;
  }
  execute(data) {
    const lowestAsk = new BigNumber(data.asks.at(this.index)[0]);
    const highestBid = new BigNumber(data.bids[0][0]);
    const midPrice = highestBid.plus(lowestAsk).dividedBy(2);
    return midPrice.toFixed(this.decimals);
  }
}

module.exports = Mid;
