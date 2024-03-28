const PriceEstimator = require("./utils/indicators/PriceEstimator");
const Config = require("./utils/Config");
const Redis = require("ioredis");
const redis = new Redis();

const config = new Config();
const { sources, initialNumberOfEntries, aggregationPeriod, estimators } =
  config.get("MarketDataStatistics");
const [exchange, market, channel, symbol] = sources.split(".");

let priceEstimator = new PriceEstimator(estimators);

let lastProcessedId = "0-0";
let initializationDone = false;

async function fetchNewEntries(streamKey) {
  let entries = [];

  if (!initializationDone) {
    entries = await redis.xrevrange(
      streamKey,
      "+",
      "-",
      "COUNT",
      initialNumberOfEntries
    );
    entries = entries.reverse();

    if (entries.length > 0) {
      lastProcessedId = entries[entries.length - 1][0];
    }
    initializationDone = true;
  } else {
    entries = await redis.xrange(streamKey, lastProcessedId, "+");

    if (entries.length > 0) {
      lastProcessedId = entries[entries.length - 1][0];
    }
  }
  return entries;
}

function processEntries(entries) {
  console.log(`Fetched ${entries.length} new entries:`);
  const dataArrays = entries.map(([id, message]) => JSON.parse(message[1]));

  const [mids, vwaps] = dataArrays.reduce(
    ([midsAcc, vwapsAcc], { mid, vwap }) => {
      if (mid !== undefined) midsAcc.push(mid);
      let estimatorsMid = priceEstimator.execute(midsAcc);
      if (vwap !== undefined) vwapsAcc.push(vwap);
      let estimatorsVwap = priceEstimator.execute(midsAcc);
      return [midsAcc, vwapsAcc];
    },
    [[], []]
  );

  console.log({ exchange, market, channel, symbol, mids, vwaps });

  // let data = priceEstimator.execute(data)
}

function startFetching(streamKey, interval) {
  setInterval(async () => {
    const entries = await fetchNewEntries(streamKey);
    processEntries(entries);
  }, interval);
}

startFetching(sources, aggregationPeriod);
