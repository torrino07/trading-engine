const DataTransformation = require("./DataTransformation");

class MidPriceTransformation extends DataTransformation {
  transform(data) {
    // Logic to calculate and return the mid price from the data
  }
}

class VWAPTransformation extends DataTransformation {
  transform(data) {
    // Logic to calculate and return the VWAP from the data
  }
}

module.exports = { MidPriceTransformation, VWAPTransformation };
