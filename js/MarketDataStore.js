const zmq = require("zeromq");
const { Buffer } = require("buffer");
const fs = require("fs");
const path = require("path");

async function main() {
  const [portsArg, topicsArg] = process.argv.slice(2);
  const ports = portsArg.includes(",") ? portsArg.split(",") : [portsArg];
  const topics = topicsArg.includes(",") ? topicsArg.split(",") : [topicsArg];

  const sock = new zmq.Subscriber();
  topics.forEach((topic) => sock.subscribe(`processed.${topic}`));
  ports.forEach((port) => sock.connect(`tcp://127.0.0.1:${port}`));

  const activePartitions = {};

  try {
    for await (const [topic, message] of sock) {
      const { exchange, market, symbol, ts, channel, data } = JSON.parse(message);

      const now = new Date();
      const datePart = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const hourPart = now.toISOString().split("T")[1].slice(0, 2); // HH
      const minutePart = now.toISOString().split("T")[1].slice(3, 5); // mm

      const baseKey = `${channel}/${exchange}/${market}/${symbol}/${datePart}/${hourPart}`;
      const partitionKey = `${baseKey}/${minutePart}`;

      if (activePartitions[baseKey]) {
        const currentPartition = activePartitions[baseKey];

        if (currentPartition.partitionKey !== partitionKey) {
          currentPartition.stream.end();
          activePartitions[baseKey] = createPartitionObj(partitionKey);
        }
      } else {
        activePartitions[baseKey] = createPartitionObj(partitionKey);
      }
      const partitionObj = activePartitions[baseKey];

      if (!partitionObj.stream) {
        createFileStreamForPartition(partitionObj);
      }

      const dataBuffer = Buffer.isBuffer(data)
        ? data
        : Buffer.from(JSON.stringify(data));
      const buffer = Buffer.alloc(12 + dataBuffer.length);
      buffer.writeUIntLE(Number(ts), 0, 6);
      buffer.writeUInt32LE(dataBuffer.length, 8);
      dataBuffer.copy(buffer, 12);

      partitionObj.stream.write(buffer);
      partitionObj.hasData = true;
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

function createPartitionObj(partitionKey) {
  return {
    partitionKey,
    hasData: false,
    stream: null,
    filePath: null,
  };
}

function createFileStreamForPartition(partitionObj) {
  const folderDir = "/Users/dorian/mnt/shared_data/binlogs"
  const now = new Date();
  const fileName = `marketdata-${now.toISOString().replace(/[:.]/g, "-")}.binlog`;
  const logDir = path.join(folderDir, partitionObj.partitionKey);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const filePath = path.join(logDir, fileName);
  console.log(`Creating log file on disk for: ${filePath}`);
  partitionObj.filePath = filePath;
  partitionObj.stream = fs.createWriteStream(filePath, { flags: "a" });
}

main();