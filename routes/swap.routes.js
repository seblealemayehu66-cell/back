import express from "express";
import axios from "axios";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* ================= SUPPORTED ASSETS ================= */
const SUPPORTED_ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "USDT"];

/* ================= PRICE CACHE ================= */
let cachedPrices = null;
let lastFetch = 0;

async function getPrices() {
  const now = Date.now();

  if (cachedPrices && now - lastFetch < 30000) {
    return cachedPrices;
  }

  try {
    const prices = {};

    const symbols = [
      { pair: "BTCUSDT", key: "BTC" },
      { pair: "ETHUSDT", key: "ETH" },
      { pair: "SOLUSDT", key: "SOL" },
      { pair: "BNBUSDT", key: "BNB" },
      { pair: "XRPUSDT", key: "XRP" },
    ];

    const requests = symbols.map((s) =>
      axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${s.pair}`)
    );

    const responses = await Promise.all(requests);

    responses.forEach((res, i) => {
      prices[symbols[i].key] = parseFloat(res.data.price);
    });

    prices.USDT = 1;

    cachedPrices = prices;
    lastFetch = now;

    return prices;
  } catch (err) {
    console.error("Price Fetch Error:", err.message);
    throw new Error("Failed to fetch prices");
  }
}

/* ================= SWAP ================= */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { fromAsset, toAsset, amount } = req.body;

    /* ===== VALIDATION ===== */
    if (!fromAsset || !toAsset || !amount) {
      return res.status(400).json({ message: "Missing data" });
    }

    if (fromAsset === toAsset) {
      return res.status(400).json({ message: "Cannot swap same asset" });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (
      !SUPPORTED_ASSETS.includes(fromAsset) ||
      !SUPPORTED_ASSETS.includes(toAsset)
    ) {
      return res.status(400).json({ message: "Unsupported asset" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    /* ===== SAFE BALANCE CHECK ===== */
    if (
      !user.balance[fromAsset] ||
      Number(user.balance[fromAsset]) < Number(amount)
    ) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const prices = await getPrices();

    if (
      prices[fromAsset] === undefined ||
      prices[toAsset] === undefined
    ) {
      return res.status(400).json({ message: "Price not available" });
    }

    /* ===== CONVERSION ===== */
    const usdValue = Number(amount) * Number(prices[fromAsset]);
    const receiveAmount = usdValue / Number(prices[toAsset]);

    /* ===== UPDATE BALANCES ===== */
    user.balance[fromAsset] =
      Number(user.balance[fromAsset]) - Number(amount);

    user.balance[toAsset] =
      (Number(user.balance[toAsset]) || 0) + receiveAmount;

    await user.save();

    res.json({
      success: true,
      received: parseFloat(receiveAmount.toFixed(6)),
      rate: prices[fromAsset] / prices[toAsset],
      balance: user.balance,
    });

  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
