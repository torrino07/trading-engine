const BigNumber = require("bignumber.js");

class VWAP {
  calculate(data, decimals) {
    let totalVolume = new BigNumber(0);
    let totalPriceVolume = new BigNumber(0);
    
    const combined = [...data.bids, ...data.asks];
    
    for (let i = 0; i < combined.length; i++) {
      const [price, volume] = combined[i];
      totalPriceVolume = totalPriceVolume.plus(new BigNumber(price).times(volume));
      totalVolume = totalVolume.plus(volume);
    }

    if (totalVolume.isEqualTo(0)) return "0";

    const vwap = totalPriceVolume.dividedBy(totalVolume);
    return vwap.toFixed(decimals);
  }
}

class Mid {
  calculate(data, decimals) {
    const highestBid = new BigNumber(data.bids[0][0]);
    const lowestAsk = new BigNumber(data.asks[data.asks.length - 1][0]);
    const midPrice = highestBid.plus(lowestAsk).dividedBy(2);
    return midPrice.toFixed(decimals);
  }
}

module.exports = { VWAP, Mid };
