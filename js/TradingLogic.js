const ExchangeFactory = require("./exchanges/ExchangeFactory");
const StrategyFactory = require("./exchanges//utils/StrategyFactory");
const Redis = require("ioredis");

const pid = process.pid;
const consumer = new Redis({ host: "127.0.0.1", port: 6379 });
const producer = new Redis({ host: "127.0.0.1", port: 6379 });

const argv = process.argv.slice(2);
let config = argv.reduce((acc, current) => {
  const [key, value] = current.split("=");
  acc[key] = value;
  return acc;
}, {});

console.log(config)
let source = config.source;
let destination = config.destination;

let exchange = ExchangeFactory.createExchange(config.exchange)
let strategy = StrategyFactory.createStrategy(config);

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
      // output goes to fast api channel strategy.execute(data)

      const msg = `hey, fast api! I am Trading Logic: ${pid}`
  
      producer.publish(destination, msg, (err, count) => {
        if (err) {
          console.error("Failed to produce message:", err.message);
          return;
        }
      });
    } catch (error) {
      console.error("Error parsing JSON message:", error);
    }
  });
  
  process.on("SIGINT", () => {
    consumer.disconnect();
    producer.disconnect();
    process.exit();
  });