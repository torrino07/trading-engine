const ExchangeFactory = require("./exchanges/ExchangeFactory");
const Config = require("./utils/Config");
const Redis = require("ioredis");
const PriceFactory = require("./utils/indicators/PriceFactory");

const pid = process.pid;
const parameters = new Redis({ host: "127.0.0.1", port: 6379 });
const consumer = new Redis({ host: "127.0.0.1", port: 6379 });
const producer = new Redis({ host: "127.0.0.1", port: 6379 });

const config = new Config();
const { exchange: exchangeName, source, task, prices } = config.get("MarketDataHandling");

let priceFactory = new PriceFactory(prices)
let exchange = ExchangeFactory.createExchange(exchangeName);
exchange.prices = priceFactory;
let handler = exchange.getHandler(task);

parameters.subscribe(`parameters.${pid}`, (err, count) => {
  console.log(`Listening for market parameter updates on ${count} channel(s).`);
});

parameters.on('message', (channel, message) => {
  try {
    const params = JSON.parse(message);
    if (params && params.prices) {
      priceFactory = new PriceFactory(params.prices);
      exchange.prices = priceFactory;
      console.log("Updated prices configuration:", params.prices);
    }
  } catch (error) {
    console.error("Error parsing or applying new parameters:", error);
  }
});

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
    let symbol = handledData.symbol;
    let destination = source + "." + symbol

    console.log(handledData)

    producer.xadd(destination, "*", "data", JSON.stringify(handledData));

  } catch (error) {
    console.error("Error parsing JSON message:", error);
  }
});

process.on("SIGINT", () => {
  parameters.disconnect();
  consumer.disconnect();
  producer.disconnect();
  process.exit();
});
