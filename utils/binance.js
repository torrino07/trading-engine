let latestTrade = null;
let latestOrderbook = null;

function handleResponse(response, exchange) {
  const data = response.data;
  if (data.e === "aggTrade") {
    handleAggTrade(data);
  } else if (data.e === "depthUpdate") {
    handleDepthUpdate(data);
  }

  return { exchange, trade: latestTrade, orderbook: latestOrderbook };
}

function handleAggTrade(data) {
  latestTrade = {
    eventType: data.e,
    eventTime: data.E,
    tradeId: data.a,
    symbol: data.s,
    price: data.p,
    quantity: data.q,
    firstTradeId: data.f,
    lastTradeId: data.l,
    tradeTime: data.T,
    isBuyerMaker: data.m,
  };
}

function handleDepthUpdate(data) {
  latestOrderbook = {
    eventType: data.e,
    eventTime: data.E,
    symbol: data.s,
    firstUpdateId: data.U,
    finalUpdateId: data.u,
    previousUpdateId: data.pu,
    bids: data.b,
    asks: data.a,
  };
}

module.exports = { handleResponse };