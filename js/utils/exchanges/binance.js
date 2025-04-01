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
  } else if (channel.startsWith("depth")) {
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

function handleStream(stream) {
  const atPos = stream.indexOf("@");
  if (atPos < 0) return null;
  const symbol = stream.substring(0, atPos).toUpperCase();
  const channel = stream.substring(atPos + 1);

  return { symbol, channel };
}

module.exports = { handleResponse };
