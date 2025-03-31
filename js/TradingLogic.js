const zmq = require("zeromq");

if (process.argv.length < 5) {
  console.error("Please provide a channel name as an argument.");
  process.exit(1);
}

let exchange = process.argv[2];
let market = process.argv[3];
let source = process.argv[4];

async function runClient() {
  const subscriberSock = new zmq.Subscriber();

  subscriberSock.connect(`tcp://127.0.0.1:5557`);
  subscriberSock.subscribe(`${exchange}.${market}.${source}`);

  try {
    for await (const [topic, message] of subscriberSock) {
      const response = JSON.parse(message);
      console.log(response)

    }
  } catch (error) {
    console.error("Error parsing new topic:", error);
  }
}

runClient();
