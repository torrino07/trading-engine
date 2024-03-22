const Config = require("./utils/Config");
const Indicators = require("./utils/Indicators");
const Redis = require("ioredis");

const pid = process.pid;
const consumer = new Redis({ host: "127.0.0.1", port: 6379 });
const producer = new Redis({ host: "127.0.0.1", port: 6379 });

const config = new Config();
const indicators = new Indicators(config.getAll());

let source = config.get("source");
let destination = config.get("destination");

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
    indicators.run(data);

    let msg = { message: null };
    producer.publish(destination, JSON.stringify(msg), (err, count) => {
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
