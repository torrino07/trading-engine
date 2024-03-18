const BigNumber = require("bignumber.js");

class VWAP {
  calculate(data, decimals, depth) {
    let totalVolume = new BigNumber(0);
    let totalPriceVolume = new BigNumber(0);

    const combined = [...data.bids.slice(depth), ...data.asks.slice(-depth)];

    for (let i = 0; i < combined.length; i++) {
      const [price, volume] = combined[i];
      totalPriceVolume = totalPriceVolume.plus(
        new BigNumber(price).times(volume)
      );
      totalVolume = totalVolume.plus(volume);
    }

    if (totalVolume.isEqualTo(0)) return "0";

    const vwap = totalPriceVolume.dividedBy(totalVolume);
    return vwap.toFixed(decimals);
  }
}

module.exports = { VWAP };
