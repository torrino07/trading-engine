const BigNumber = require("bignumber.js");

class VWAP {
  calculate(data) {
    let totalVolume = 0;
    let totalPriceVolume = 0;
    
    const combined = [...data.bids, ...data.asks];
    
    for (let i = 0; i < combined.length; i++) {
      const [price, volume] = combined[i];
      totalPriceVolume += parseFloat(price) * parseFloat(volume);
      totalVolume += parseFloat(volume);
    }

    if (totalVolume === 0) return 0;

    const vwap = totalPriceVolume / totalVolume;
    return vwap;
  }
}


class Mid {
  calculate(data) {
    const highestBid = parseFloat(data.bids[0][0]);
    const lowestAsk = parseFloat(data.asks[data.asks.length - 1][0]);
    const midPrice = (highestBid + lowestAsk) / 2;
    return midPrice;
  }
}

module.exports = { VWAP, Mid };
