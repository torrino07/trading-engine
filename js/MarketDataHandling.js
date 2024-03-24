const ExchangeFactory = require("./exchanges/ExchangeFactory");
const PriceEstimator = require("./utils/indicators/PriceEstimator");
const Config = require("./utils/Config");
const Redis = require("ioredis");

const pid = process.pid;
const consumer = new Redis({ host: "127.0.0.1", port: 6379 });
const producer = new Redis({ host: "127.0.0.1", port: 6379 });

const config = new Config();
const {
  exchange: exchangeName,
  source,
  destination,
  task,
  estimators,
} = config.get("MarketDataHandling");

let exchange = ExchangeFactory.createExchange(exchangeName);
let priceEstimator = new PriceEstimator(estimators);
let handler = exchange.getHandler(task);

consumer.subscribe(source, (err, count) => {
  if (err) {
    console.error("Failed to subscribe:", err.message);
    return;
  }
  console.log(`Subscribed to ${count} channel(s).`);
});

consumer.on("message", (channel, message) => {
  try {
    const data = JSON.parse(message);
    let handledData = handler(data);
    let processedData = priceEstimator.execute(handledData);
    let symbol =  processedData.symbol;

    console.log(processedData);
    producer.xadd(`${destination}.${symbol}` , "*", "data", JSON.stringify(processedData));

  } catch (error) {
    console.error("Error parsing JSON message:", error);
  }
});

process.on("SIGINT", () => {
  consumer.disconnect();
  producer.disconnect();
  process.exit();
});
