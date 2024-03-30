const ExchangeFactory = require("./exchanges/ExchangeFactory");
const StrategyFactory = require("./strategies/StrategyFactory");
const Config = require("./utils/Config");
const Redis = require("ioredis");

const pid = process.pid;
const parameters = new Redis({ host: "127.0.0.1", port: 6379 });
const consumer = new Redis({ host: "127.0.0.1", port: 6379 });
const producer = new Redis({ host: "127.0.0.1", port: 6379 });

const config = new Config();

const { exchange: exchangeName, sources, settings} =
  config.get("TradingLogic");

let exchange = ExchangeFactory.createExchange(exchangeName);
let strategy = StrategyFactory.createStrategy(settings);

// FIX SOURCE TO BE MULTIPLE OR ONE CHANNEL
consumer.subscribe(sources, (err, count) => {
  if (err) {
    console.error("Failed to subscribe:", err.message);
    return;
  }
  console.log(`Subscribed to ${count} channel(s).`);
});

consumer.on("message", (channel, message) => {
  try {
    const data = JSON.parse(message);
    strategy.run(data);

    let msg = {
      pid: pid,
      exchange: exchangeName,
      strategy: strategy.name,
      message: strategy.message,
    };
    
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
