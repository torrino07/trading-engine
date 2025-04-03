function handleResponse(response) {
  const { exchange, market, payload } = response;
  const { data, stream } = payload;
  const { symbol, channel } = parseStream(stream);

  if (market === "spot") {
    if (channel === "trade") {
      const tradeData = handleSpotTrade(data);
      return { exchange, market, symbol, channel: "trades", data: tradeData };
    } else if (channel.startsWith("depth")) {
      const orderbookData = handleSpotDepth(data);
      return {
        exchange,
        market,
        symbol,
        channel: "orderbook",
        data: orderbookData,
      };
    } else {
      console.error(
        `Unsupported channel: ${channel} for exchange: ${exchange}`
      );
      return null;
    }
  } else if (market === "futures") {
    return null;
  }
}

function handleSpotTrade(data) {
  return {
    eventTime: data.E,
    tradeId: data.t,
    price: data.p,
    quantity: data.q,
    tradeTime: data.T,
    isBuyerMaker: data.m ? 1 : 0,
  };
}

function handleSpotDepth(data) {
  return {
    bids: data.bids,
    asks: data.asks,
  };
}

function parseStream(stream) {
  const atPos = stream.indexOf("@");
  if (atPos < 0) throw new Error(`Invalid stream format: ${stream}`);
  const symbol = stream.substring(0, atPos).toUpperCase();
  const channel = stream.substring(atPos + 1);

  return { symbol, channel };
}

module.exports = { handleResponse };
