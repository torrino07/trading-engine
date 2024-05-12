const PriceFactory = require("./utils/indicators/PriceFactory");
const ExchangeFactory = require("./exchanges/ExchangeFactory");
const Config = require("./utils/Config");
const Redis = require("ioredis");

const pid = process.pid;
const parameters = new Redis({ host: "127.0.0.1", port: 6379 });
const consumer = new Redis({ host: "127.0.0.1", port: 6379 });
const producer = new Redis({ host: "127.0.0.1", port: 6379 });

const config = new Config();
const { exchange: exchangeName, source, task, prices } = config.get("MarketDataHandling");

let exchange  = ExchangeFactory.createExchange(exchangeName);
exchange.registerTask(task);
exchange.prices = new PriceFactory(prices);
let handler = exchange.getHandler(task);

parameters.subscribe(`parameters.${pid}`, (err, count) => {
  console.log(`Listening for market parameter updates on ${count} channel(s).`);
});

parameters.on('message', (channel, message) => {
  try {
    const params = JSON.parse(message);
    if (params && params.prices) {
      exchange.prices = new PriceFactory(params.prices);
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
    console.log(data)
    let handledData = handler(data);
    let symbol = handledData.symbol;
    console.log(handledData);
    producer.xadd(source + "." + symbol, "*", "data", JSON.stringify(handledData));
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
