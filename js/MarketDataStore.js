const zmq = require("zeromq");
const { Buffer } = require("buffer");
const fs = require("fs");
const path = require("path");

const ROTATION_INTERVAL_MS = 60000;

async function main() {
  const [portsArg, topicsArg] = process.argv.slice(2);

  const ports = portsArg.includes(",") ? portsArg.split(",") : [portsArg];
  const topics = topicsArg.includes(",") ? topicsArg.split(",") : [topicsArg];

  const sock = new zmq.Subscriber();

  topics.forEach((topic) => sock.subscribe(`processed.${topic}`));
  ports.forEach((port) => sock.connect(`tcp://127.0.0.1:${port}`));

  const streams = {};

  setInterval(() => {
    for (const key in streams) {
      streams[key].end();
      streams[key] = createLogStream(key);
    }
  }, ROTATION_INTERVAL_MS);

  try {
    for await (const [topic, message] of sock) {
      const timestamp = BigInt(Date.now()) * 1000000n;

      const { exchange, market, symbol, channel, data } = JSON.parse(message);

      const now = new Date();
      const datePart = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const hourPart = now.toISOString().split("T")[1].slice(0, 2); // HH
      const minutePart = now.toISOString().split("T")[1].slice(3, 5); // mm

      const partitionKey = `${exchange}/${market}/${symbol}/${channel}/${datePart}/${hourPart}/${minutePart};`;

      if (!streams[partitionKey]) {
        streams[partitionKey] = createLogStream(partitionKey);
      }

      const dataBuffer = Buffer.from(JSON.stringify(data));
      const buffer = Buffer.alloc(12 + dataBuffer.length);
      buffer.writeBigInt64LE(timestamp, 0);
      buffer.writeUInt32LE(dataBuffer.length, 8);
      dataBuffer.copy(buffer, 12);

      streams[partitionKey].write(buffer);
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

function createLogStream(partitionKey) {
  const fileName = `marketdata-${new Date().toISOString().replace(/[:.]/g, '-')}.binlog`;
  const logDir = path.join(__dirname, "../marketdata", partitionKey);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const filePath = path.join(logDir, fileName);
  console.log(`Creating log stream for: ${filePath}`);
  return fs.createWriteStream(filePath, { flags: 'a' });
}

main();