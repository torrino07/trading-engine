const zmq = require("zeromq")

async function main() {
  const [portsArg, topicsArg] = process.argv.slice(2);

  const ports = portsArg.includes(",") ? portsArg.split(",") : [portsArg];
  const topics = topicsArg.includes(",") ? topicsArg.split(",") : [topicsArg];
  
  const sock = new zmq.Subscriber();

  topics.forEach(topic => sock.subscribe(`processed.${topic}`));
  ports.forEach(port => sock.connect(`tcp://127.0.0.1:${port}`));

  try {
    for await (const [topic, message] of sock) {
      const response = JSON.parse(message);
      console.log(response)

    }
  } catch (error) {
    console.error("Error parsing new topic:", error);
  }
}

main();