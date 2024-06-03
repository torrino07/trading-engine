const WebSocket = require("ws");

const host = "fstream.binance.com:443";
const handshake = "/stream?streams=";
const request = {
  "method": "SUBSCRIBE",
  "params": ["btcusdt@depth5@100ms", "btcusdt@aggTrade"],
};
const url = "wss://" + host + handshake;

const ws = new WebSocket(url);

ws.on("open", function open() {
  ws.send(JSON.stringify(request));
});

ws.on("message", function incoming(data) {
  try {
    const message = JSON.parse(data);

    console.log(message.data)

  } catch (error) {
    console.error("Error parsing JSON data:", error);
  }
});

ws.on("error", function handleError(error) {
  console.error("WebSocket encountered an error:", error);
});

ws.on("close", function handleClose(code, reason) {
  console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
});
