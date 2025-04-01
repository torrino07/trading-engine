const zmq = require("zeromq");

if (process.argv.length < 4) {
  console.error("Please provide exchange, market, and source as arguments.");
  process.exit(1);
}

async function main() {

  let exchange = process.argv[2];
  let market = process.argv[3];

  const { handleResponse } = require(`./utils/exchanges/${exchange}`);

  const subscriberSock = new zmq.Subscriber();
  const publisherSock = new zmq.Publisher();

  subscriberSock.connect(`tcp://127.0.0.1:5555`);
  subscriberSock.subscribe(`${exchange}.${market}`);

  await publisherSock.bind(`tcp://127.0.0.1:5556`);

  async function sendMessage(message) {
    try {
      await publisherSock.send(message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  try {
    for await (const [topic, message] of subscriberSock) {
      const response = JSON.parse(message);
      const parsedData = handleResponse(response);
      console.log(parsedData)

      const messageToSend = [
        `${exchange}.${market}.parsed`,
        JSON.stringify(parsedData),
      ];

      await sendMessage(messageToSend);
    }
  } catch (error) {
    console.error("Error parsing new topic:", error);
  }
}

main();
