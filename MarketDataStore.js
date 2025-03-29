const zmq = require("zeromq");
const { Client } = require("pg");

const BATCH_SIZE = 1000;
let dataBuffer = [];
let isInserting = false;

const client = new Client({
  connectionString: "postgresql://dgtalledo:vyiKFtvh84T0aYR6RaecZw@agile-oyster-8591.7tc.aws-eu-central-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full"
});

client.connect();

async function runClient() {
  const subscriberSock = new zmq.Subscriber();

  subscriberSock.connect(`tcp://127.0.0.1:5556`);
  subscriberSock.subscribe(``);

  try {
    for await (const [topic, message] of subscriberSock) {
      const response = JSON.parse(message);
      storeInBuffer(response);
      
      if (dataBuffer.length >= BATCH_SIZE && !isInserting) {
        isInserting = true;
        sendToDatabase(dataBuffer).then(() => {
          clearBuffer();
          isInserting = false;
        }).catch(error => {
          console.error("Error inserting data into the database:", error);
          isInserting = false;
        });
      }

      getDataBuffer()
    }
  } catch (error) {
    console.error("Error parsing new topic:", error);
  }
}

runClient();

function storeInBuffer(data) {
  dataBuffer.push(data);
}

function clearBuffer() {
    dataBuffer = [];
}

function getDataBuffer(){
  console.log(dataBuffer);
}

async function sendToDatabase(data) {
  const query = `
    INSERT INTO market_data (event_time, data)
    VALUES ($1, $2)
  `;

  const values = data.map(item => [
    item.eventTime,
    JSON.stringify(item)
  ]);

  try {
    await client.query('BEGIN');
    for (const value of values) {
      await client.query(query, value);
    }
    await client.query('COMMIT');
    console.log(`Inserted ${values.length} records into the database.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error inserting data into the database:", error);
  }
}