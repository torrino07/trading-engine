class EWMA {
  constructor() {
    this.previousEWMA = null;
  }

  calculate(newPrice, lambda) {
    if (this.previousEWMA === null) {
      this.previousEWMA = newPrice;
    } else {
      this.previousEWMA = lambda * newPrice + (1 - lambda) * this.previousEWMA;
    }
    return this.previousEWMA;
  }
}


module.exports = { EWMA };
