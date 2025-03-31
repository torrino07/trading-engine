let latestTrade = {};
let latestOrderbook = {};

function handleResponse(response, exchange, market) {
  const data = response.data;
  const stream = response.stream
  if (data.e === "trade") {
    handleSpotTrade(data);
  } else if (stream) {
    handleSpotDepthUpdate(data, stream);
  }
  return { exchange, market, trade: latestTrade, orderbook: latestOrderbook };
}

function handleSpotTrade(data) {
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

function handleSpotDepthUpdate(data, stream) {
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