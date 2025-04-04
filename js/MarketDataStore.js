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

  // Instead of storing only a stream, we store an object with:
  //   - hasData (bool)
  //   - stream (WriteStream or null)
  //   - filePath (string or null)
  const partitions = {};

  // Rotate any partition that has data, skip empty or never-used ones
  setInterval(() => {
    for (const key in partitions) {
      const p = partitions[key];
      if (p.hasData && p.stream) {
        // End the current file
        p.stream.end();
        // Create a new stream for the next interval
        partitions[key] = createPartitionObj(key);
      } else {
        // No data was ever written or no data in this interval
        // so we skip rotating or recreating the file
        console.log(`Skipping rotation for ${key} as no data was written.`);
      }
    }
  }, ROTATION_INTERVAL_MS);

  try {
    for await (const [topic, message] of sock) {
      const timestamp = BigInt(Date.now()) * 1000000n;
      const { exchange, market, symbol, channel, data } = JSON.parse(message);

      // Build partition key with minute-level granularity
      const now = new Date();
      const datePart = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const hourPart = now.toISOString().split("T")[1].slice(0, 2); // HH
      const minutePart = now.toISOString().split("T")[1].slice(3, 5); // mm

      const partitionKey = `${channel}/${exchange}/${market}/${symbol}/${datePart}/${hourPart}/${minutePart}`;

      // Get or create the partition object (in memory), but don't create file yet
      if (!partitions[partitionKey]) {
        partitions[partitionKey] = createPartitionObj(partitionKey);
      }

      const partitionObj = partitions[partitionKey];

      // If we haven't yet created a stream on disk, do it now
      if (!partitionObj.stream) {
        createFileStreamForPartition(partitionObj);
      }

      // Prepare the data to write
      const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
      const buffer = Buffer.alloc(12 + dataBuffer.length);
      buffer.writeBigInt64LE(timestamp, 0);
      buffer.writeUInt32LE(dataBuffer.length, 8);
      dataBuffer.copy(buffer, 12);

      // Write to the stream
      partitionObj.stream.write(buffer);
      partitionObj.hasData = true;
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

/**
 * Create an in-memory partition object without creating the file immediately.
 */
function createPartitionObj(partitionKey) {
  return {
    partitionKey,
    hasData: false,
    stream: null,
    filePath: null,
  };
}

/**
 * Actually create the file stream on disk. This is only called once
 * data arrives, ensuring we never create zero-byte files for unused partitions.
 */
function createFileStreamForPartition(partitionObj) {
  const now = new Date();
  const fileName = `marketdata-${now.toISOString().replace(/[:.]/g, '-')}.binlog`;

  const logDir = path.join(__dirname, "../marketdata", partitionObj.partitionKey);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const filePath = path.join(logDir, fileName);
  console.log(`Creating log file on disk for: ${filePath}`);

  partitionObj.filePath = filePath;
  partitionObj.stream = fs.createWriteStream(filePath, { flags: 'a' });
}

main();