const BigNumber = require("bignumber.js");

class VWAP {
  constructor(settings) {
    this.decimals = settings.decimals;
    this.bidIndex = settings.bidIndex;
    this.askIndex = settings.askIndex;
    this.arrayLength = settings.arrayLength;
  }

  execute(data) {
    let totalVolume = new BigNumber(0);
    let totalPriceVolume = new BigNumber(0);

    const combined = [
      ...data.bids.slice(0, this.bidIndex),
      ...data.asks.slice(this.askIndex, this.arrayLength),
    ];

    for (let i = 0; i < combined.length; i++) {
      const [price, volume] = combined[i];
      totalPriceVolume = totalPriceVolume.plus(
        new BigNumber(price).times(volume)
      );
      totalVolume = totalVolume.plus(volume);
    }
    const vwap = totalPriceVolume.dividedBy(totalVolume);
    return vwap.toFixed(this.decimals);
  }
}

module.exports = VWAP;
