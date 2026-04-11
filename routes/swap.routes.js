import express from "express";
import axios from "axios";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* ================= SUPPORTED ASSETS ================= */
const ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "USDT"];

/* ================= CACHE ================= */
let cachedPrices = null;
let lastFetch = 0;

/* ================= BINANCE ================= */
async function fetchFromBinance() {
  const symbols = [
    { pair: "BTCUSDT", key: "BTC" },
    { pair: "ETHUSDT", key: "ETH" },
    { pair: "SOLUSDT", key: "SOL" },
    { pair: "BNBUSDT", key: "BNB" },
    { pair: "XRPUSDT", key: "XRP" },
  ];

  const requests = symbols.map((s) =>
    axios.get(`https://api1.binance.com/api/v3/ticker/price?symbol=${s.pair}`)
  );

  const responses = await Promise.all(requests);

  const prices = {};
  responses.forEach((res, i) => {
    prices[symbols[i].key] = parseFloat(res.data.price);
  });

  prices.USDT = 1;
  return prices;
}

/* ================= COINGECKO ================= */
async function fetchFromCoinGecko() {
  const res = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price",
    {
      params: {
        ids: "bitcoin,ethereum,solana,binancecoin,ripple",
        vs_currencies: "usd",
      },
    }
  );

  return {
    BTC: res.data.bitcoin.usd,
    ETH: res.data.ethereum.usd,
    SOL: res.data.solana.usd,
    BNB: res.data.binancecoin.usd,
    XRP: res.data.ripple.usd,
    USDT: 1,
  };
}

/* ================= HYBRID PRICE ENGINE ================= */
async function getPrices() {
  const now = Date.now();

  // cache 30s
  if (cachedPrices && now - lastFetch < 30000) {
    return cachedPrices;
  }

  try {
    let prices;

    // TRY BINANCE FIRST
    try {
      prices = await fetchFromBinance();
    } catch (e1) {
      console.log("Binance failed → switching to CoinGecko");
      prices = await fetchFromCoinGecko();
    }

    cachedPrices = prices;
    lastFetch = now;

    return prices;
  } catch (err) {
    console.log("ALL APIs FAILED → using cache");
    return cachedPrices || {};
  }
}

/* ================= SWAP ROUTE ================= */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { fromAsset, toAsset, amount } = req.body;

    if (!fromAsset || !toAsset || !amount) {
      return res.status(400).json({ message: "Missing data" });
    }

    if (fromAsset === toAsset) {
      return res.status(400).json({ message: "Cannot swap same asset" });
    }

    if (!ASSETS.includes(fromAsset) || !ASSETS.includes(toAsset)) {
      return res.status(400).json({ message: "Unsupported asset" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      !user.balance[fromAsset] ||
      user.balance[fromAsset] < amount
    ) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const prices = await getPrices();

    if (!prices[fromAsset] || !prices[toAsset]) {
      return res.status(400).json({ message: "Price not available" });
    }

    const usdValue = Number(amount) * prices[fromAsset];
    const receiveAmount = usdValue / prices[toAsset];

    user.balance[fromAsset] -= Number(amount);
    user.balance[toAsset] =
      (user.balance[toAsset] || 0) + receiveAmount;

    await user.save();

    res.json({
      success: true,
      received: Number(receiveAmount.toFixed(6)),
      rate: prices[fromAsset] / prices[toAsset],
      balance: user.balance,
    });

  } catch (err) {
    console.error("SWAP ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
