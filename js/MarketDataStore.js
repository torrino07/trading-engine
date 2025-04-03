const { createLogStream } = require("./utils/createLogStream")
const zmq = require("zeromq");
const { Buffer } = require("buffer");

async function main() {
  const [portsArg, topicsArg] = process.argv.slice(2);

  const ports = portsArg.includes(",") ? portsArg.split(",") : [portsArg];
  const topics = topicsArg.includes(",") ? topicsArg.split(",") : [topicsArg];

  const sock = new zmq.Subscriber();

  topics.forEach(topic => sock.subscribe(`processed.${topic}`));
  ports.forEach(port => sock.connect(`tcp://127.0.0.1:${port}`));

  let currentStream = createLogStream();

  setInterval(() => {
    currentStream.end();
    currentStream = createLogStream();
  }, 10000);

  try {
    for await (const [topic, message] of sock) {
      const timestamp = BigInt(Date.now()) * 1000000n;
      const dataBuffer = Buffer.from(message);
      const buffer = Buffer.alloc(12 + dataBuffer.length);
      buffer.writeBigInt64LE(timestamp, 0);
      buffer.writeUInt32LE(dataBuffer.length, 8);
      dataBuffer.copy(buffer, 12);

      currentStream.write(buffer);
    }
  } catch (error) {
    console.error("Error parsing new topic:", error);
  }
}

main();
