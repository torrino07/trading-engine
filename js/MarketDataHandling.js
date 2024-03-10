const ExchangeFactory = require("./exchanges/ExchangeFactory");
const TaskManager = require("./exchanges/utils/TaskManager");
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

let taskIdentifier = config.source;
let source = config.source;
let destination = config.destination;

let exchange = ExchangeFactory.createExchange(config.exchange).registerTaskHandlers();
let handler = TaskManager.getHandler(taskIdentifier);

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

    producer.publish(destination, JSON.stringify(handledData), (err, count) => {
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
