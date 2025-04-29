const zmq = require("zeromq");

async function main() {
  const [subPort, pubPort, topic] = process.argv.slice(2)

  const { handleResponse } = require(`./utils/exchanges/${topic}`);

  const subscriberSock = new zmq.Subscriber();
  const publisherSock = new zmq.Publisher();

  subscriberSock.subscribe(topic);
  
  subscriberSock.connect(`tcp://127.0.0.1:${subPort}`);
  await publisherSock.bind(`tcp://127.0.0.1:${pubPort}`);

  try {
    for await (const [topic, message] of subscriberSock) {
      const response = JSON.parse(message);
      const parsedData = handleResponse(response);
      const { market, channel } = parsedData;

      try {
        await publisherSock.send([
          `processed.${topic}.${market}.${channel}`,
          JSON.stringify(parsedData),
        ])
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  } catch (error) {
    console.error("Error parsing new topic:", error);
  }
}

main();
