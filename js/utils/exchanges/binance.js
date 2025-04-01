let orderbook = {};
let trades = {};

function handleResponse(response) {
  const { exchange, market, payload } = response;
  const data = payload.data;
  const stream = payload.stream;
  const { symbol, channel } = handleStream(stream);

  if (channel == "trade") {
    handleSpotTrade(data);
    return { exchange: exchange, market, symbol, trades };
  } else if (channel.includes("depth")) {
    handleSpotDepth(data);
    return { exchange: exchange, market, symbol, orderbook };
  } else {
    console.error(`Unsupported exchange: ${exchange}`);
    return null;
  }
}

function handleSpotTrade(data) {
  trades = {
    eventType: data.e,
    eventTime: data.E,
    tradeId: data.t,
    price: data.p,
    quantity: data.q,
    tradeTime: data.T,
    isBuyerMaker: data.m ? 1 : 0,
  };
}

function handleSpotDepth(data) {
  orderbook = {
    lastUpdateId: data.lastUpdateId,
    bids: data.bids,
    asks: data.asks,
  };
}

function handleFuturesTrade(data) {
  return {};
}

function handleFuturesDepth(data) {
  return {};
}

function handleStream(stream) {
  const streamArray = stream.split("@");
  const symbol = streamArray[0].toUpperCase();
  const channel = streamArray[1];
  return { symbol, channel };
}

module.exports = { handleResponse };
