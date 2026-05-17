import WebSocket from "ws";

const prices = {
  BTC: 0,
  ETH: 0,
  SOL: 0,
  BNB: 0,
  XRP: 0,
  USDT: 1,
};

const symbolMap = {
  BTCUSDT: "BTC",
  ETHUSDT: "ETH",
  SOLUSDT: "SOL",
  BNBUSDT: "BNB",
  XRPUSDT: "XRP",
};

const streams = Object.keys(symbolMap)
  .map((s) => `${s.toLowerCase()}@trade`)
  .join("/");

function connect() {
  const ws = new WebSocket(
    `wss://stream.binance.com:9443/stream?streams=${streams}`
  );

  ws.on("open", () => {
    console.log("WebSocket connected ✅");
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);
      const trade = msg.data;

      const symbol = trade.s;
      const price = parseFloat(trade.p);

      const key = symbolMap[symbol];
      if (key) {
        prices[key] = price;
      }
    } catch (err) {
      console.error("WS parse error:", err.message);
    }
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err.message);
  });

  ws.on("close", () => {
    console.log("WebSocket closed, reconnecting in 5s...");
    setTimeout(connect, 5000);
  });
}

connect();

export function getPrices() {
  return prices;
}
