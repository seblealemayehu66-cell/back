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

const ws = new WebSocket(
  `wss://stream.binance.com:9443/stream?streams=${streams}`
);

ws.on("message", (data) => {
  const msg = JSON.parse(data);
  const trade = msg.data;

  const symbol = trade.s;
  const price = parseFloat(trade.p);

  const key = symbolMap[symbol];
  if (key) {
    prices[key] = price;
  }
});

export function getPrices() {
  return prices;
}
