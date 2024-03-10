const ExchangeFactory = require("./exchanges/ExchangeFactory");
const TaskManager = require("./exchanges/utils/TaskManager");
const Redis = require("ioredis");

// Parsing command-line arguments
const argv = process.argv.slice(2);
let config = argv.reduce((acc, current) => {
  const [key, value] = current.split("=");
  acc[key] = value;
  return acc;
}, {});

console.log(config);

let exchange = ExchangeFactory.createExchange(config.exchange);
exchange.registerTaskHandlers();

const inChannel = `${config.exchange}.${config.market}.${config.in}`;
const outChannel = `${config.exchange}.${config.market}.${config.out}`;

let handler = TaskManager.getHandler(inChannel);

const consumer = new Redis({ host: "127.0.0.1", port: 6379 });
const producer = new Redis({ host: "127.0.0.1", port: 6379 });

consumer.subscribe(inChannel, (err, count) => {
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
    console.log(handledData);

    producer.publish(outChannel, JSON.stringify(handledData), (err, count) => {
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
