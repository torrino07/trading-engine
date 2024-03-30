const ExchangeFactory = require("./exchanges/ExchangeFactory");
const Config = require("./utils/Config");
const Redis = require("ioredis");
const PriceFactory = require("./utils/indicators/PriceFactory");

const pid = process.pid;
const consumer = new Redis({ host: "127.0.0.1", port: 6379 });
const producer = new Redis({ host: "127.0.0.1", port: 6379 });

const config = new Config();
const {
  exchange: exchangeName,
  source,
  destination,
  task,
 prices,
} = config.get("MarketDataHandling");

let priceFactory = new PriceFactory(prices)
let exchange = ExchangeFactory.createExchange(exchangeName);
exchange.prices = priceFactory;
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
    let symbol = handledData.symbol;

    console.log(handledData)

    producer.xadd(`${destination}.${symbol}` , "*", "data", JSON.stringify(handledData));

  } catch (error) {
    console.error("Error parsing JSON message:", error);
  }
});

process.on("SIGINT", () => {
  consumer.disconnect();
  producer.disconnect();
  process.exit();
});
