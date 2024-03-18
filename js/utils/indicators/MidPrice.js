const BigNumber = require("bignumber.js");

class Mid {
  calculate(data, decimals, depth = 0) {
    const highestBid = new BigNumber(data.bids[depth][0]);
    const lowestAsk = new BigNumber(data.asks[data.asks.length - 1][0]);
    const midPrice = highestBid.plus(lowestAsk).dividedBy(2);
    return midPrice.toFixed(decimals);
  }
}

module.exports = { Mid };
