const StrategyFactory = require("./strategies/StrategyFactory");
const Config = require("./utils/Config");
const Redis = require("ioredis");

const pid = process.pid;
const parameters = new Redis({ host: "127.0.0.1", port: 6379 });
const consumer = new Redis({ host: "127.0.0.1", port: 6379 });
const producer = new Redis({ host: "127.0.0.1", port: 6379 });

const config = new Config();

const { sources, settings } = config.get("TradingLogic");

let strategy = StrategyFactory.createStrategy(settings);

parameters.subscribe(`parameters.`, (err, count) => {
  console.log(`Listening for market parameter updates on ${count} channel(s).`);
});

parameters.on('message', (channel, message) => {
  try {
    const params = JSON.parse(message);
    if (params && params.settings) {
      strategy = StrategyFactory.createStrategy(params.settings);
      console.log("Updated parameter settings:", params.settings);
    }
  } catch (error) {
    console.error("Error parsing or applying new parameters:", error);
  }
});

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

    producer.xadd(`TradingLogic.${pid}`, "*", "data", JSON.stringify({
      pid: pid,
      exchange: exchangeName,
      strategy: settings.strategy,
      message: strategy.message,
    }));
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
