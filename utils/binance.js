let latestTrade = {};
let latestOrderbook = {};

function handleResponse(response, exchange) {
  const data = response.data;
  const stream = response.stream
  if (data.e === "trade") {
    handleTrade(data);
  } else if (stream) {
    handleDepthUpdate(data, stream);
  }
  return { exchange, trade: latestTrade, orderbook: latestOrderbook };
}

function handleTrade(data) {
  latestTrade[data.s] = {
    eventType: data.e,
    eventTime: data.E,
    tradeId: data.t,
    symbol: data.s,
    price: data.p,
    quantity: data.q,
    tradeTime: data.T,
    isBuyerMaker: data.m,
  };
}

function handleDepthUpdate(data, stream) {
  latestOrderbook[handleStream(stream)] = {
    lastUpdateId: data.lastUpdateId,
    bids: data.bids,
    asks: data.asks,
  };
}

function handleStream(stream){
  return stream.split("@")[0].toUpperCase()
}
module.exports = { handleResponse };