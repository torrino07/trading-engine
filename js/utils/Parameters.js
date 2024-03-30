const Redis = require('ioredis');
const publisher = new Redis({ host: "127.0.0.1", port: 6379 });

const newParameters = {
  MarketDataHandling: {
    prices: [
      {
        name: "mid",
        settings: {
          decimals: 20,
          index: 0
        }
      },
      {
        name: "vwap",
        settings: {
          bidIndex: 29999,
          askIndex: 0,
          arrayLength: 12
        }
      }
    ]
  },
  MarketDataStatistics: {
    aggregationPeriod: "0.01m",
    signals: [
      {
        name: "returns",
        settings: {
          decimals: 2
        }
      },
      {
        name: "sma",
        settings: {
          decimals: 2
        }
      },
      {
        name: "ewma",
        settings: {
          lambda: 0.2,
          decimals: 2,
        }
      }
    ]
  }
  ,
  TradingLogic: {

  }
};

const MarketDataHandling = newParameters.MarketDataHandling;
const MarketDataStatistics = newParameters.MarketDataStatistics;
const TradingLogic = newParameters.TradingLogic;

publisher.publish(`parameters.`, JSON.stringify(MarketDataStatistics));
console.log("Published new parameters");
