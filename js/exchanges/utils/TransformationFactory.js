class TransformationFactory {
    static getTransformation(type) {
      switch (type) {
        case "mid":
          const { MidPriceTransformation } = require("./Transformations")
          return new MidPriceTransformation();
        case "vwap":
          const { VWAPTransformation} = require("./Transformations")
          return new VWAPTransformation();
        default:
          throw new Error("Unknown transformation type.");
      }
    }
  }
  
module.exports = TransformationFactory;