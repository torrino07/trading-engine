const SignalFactory = require("./utils/indicators/SignalFactory");
const Config = require("./utils/Config");
const TimeConverter = require("./utils/TimeConverter");
const Redis = require("ioredis");

const pid = process.pid;
const parameters = new Redis({ host: "127.0.0.1", port: 6379 });
const consumer = new Redis({ host: "127.0.0.1", port: 6379 });
const producer = new Redis({ host: "127.0.0.1", port: 6379 });

const config = new Config();
const { sources, initialNumberOfEntries, aggregationPeriod, signals } = config.get("MarketDataStatistics");
const [exchange, market, channel, symbol] = sources.split(".");

let destination = sources + "." + aggregationPeriod;
let period = TimeConverter.minuteFormatToMillisecs(aggregationPeriod);
let signalFactory = new SignalFactory(signals);

parameters.subscribe(`parameters.`, (err, count) => {
  console.log(`Listening for market parameter updates on ${count} channel(s).`);
});

parameters.on('message', (channel, message) => {
  try {
    const params = JSON.parse(message);
    if (params && params.signals && params.aggregationPeriod) {
      period = TimeConverter.minuteFormatToMillisecs(params.aggregationPeriod);
      console.log("New period set:", period);
      signalFactory = new SignalFactory(params.signals);
      startFetching(sources, period);
      console.log("Updated signals configuration:", params);
    }
  } catch (error) {
    console.error("Error parsing or applying new parameters:", error);
  }
});

let fetchIntervalId;
let lastProcessedId = "0-0";
let initializationDone = false;

async function fetchNewEntries(streamKey) {
  let entries = [];

  if (!initializationDone) {
    entries = await consumer.xrevrange(streamKey, "+", "-", "COUNT", initialNumberOfEntries);
    entries = entries.reverse();

    if (entries.length > 0) {
      lastProcessedId = entries[entries.length - 1][0];
    }
    initializationDone = true;
  } else {
    entries = await consumer.xrange(streamKey, lastProcessedId, "+");

    if (entries.length > 0) {
      lastProcessedId = entries[entries.length - 1][0];
    }
  }
  return entries;
}

function processEntries(entries) {
  const timestamp = Date.now();
  const dataArrays = entries.map(([id, message]) => JSON.parse(message[1]));

  const { mids, vwaps } = dataArrays.reduce(
    (acc, entry) => {
      if ("mid" in entry) {
        acc.mids.push(entry.mid);
      }
      if ("vwap" in entry) {
        acc.vwaps.push(entry.vwap);
      }
      return acc;
    },
    { mids: [], vwaps: [] }
  );

  const result = {
    exchange: exchange,
    market: market,
    channel: channel,
    symbol: symbol,
    timestamp: timestamp,
  };

  if (mids.length > 0) {
    result.mid = signalFactory.execute(mids);
  }
  if (vwaps.length > 0) {
    result.vwap = signalFactory.execute(vwaps);
  }
  return result;
}

function startFetching(streamKey, interval) {
  if (fetchIntervalId) {
    clearInterval(fetchIntervalId);
  }

  fetchIntervalId = setInterval(async () => {
    const entries = await fetchNewEntries(streamKey);
    const processedEntries = processEntries(entries);
    console.log(processedEntries);
    producer.xadd(`${destination}`, "*", "data", JSON.stringify(processedEntries));
  }, interval);
}

startFetching(sources, period);

process.on("SIGINT", () => {
  parameters.disconnect();
  consumer.disconnect();
  producer.disconnect();
  process.exit();
});
