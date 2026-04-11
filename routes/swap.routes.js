import express from "express";
import axios from "axios";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* ================= PRICE CACHE ================= */
let cachedPrices = null;
let lastFetch = 0;

async function getPrices() {
  const now = Date.now();

  // cache for 30 seconds
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
      { pair: "XRPUSDT", key: "XRP" }
    ];

    const requests = symbols.map((s) =>
      axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${s.pair}`)
    );

    const responses = await Promise.all(requests);

    responses.forEach((res, index) => {
      const price = parseFloat(res.data.price);
      const key = symbols[index].key;
      prices[key] = price;
    });

    // USDT = 1 USD
    prices.USDT = 1;

    cachedPrices = prices;
    lastFetch = now;

    console.log("BINANCE PRICES:", prices);

    return prices;
  } catch (err) {
    console.error("Price Fetch Error:", err.message);
    throw new Error("Failed to fetch prices");
  }
}

/* ================= SWAP ================= */
router.post("/swap", authMiddleware, async (req, res) => {
  try {
    const { fromAsset, toAsset, amount } = req.body;

    // validation
    if (!fromAsset || !toAsset || !amount)
      return res.status(400).json({ message: "Missing data" });

    if (fromAsset === toAsset)
      return res.status(400).json({ message: "Cannot swap same asset" });

    if (Number(amount) <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.balance[fromAsset] || user.balance[fromAsset] < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    const prices = await getPrices();

    if (!prices[fromAsset] || !prices[toAsset])
      return res.status(400).json({ message: "Invalid asset" });

    /* ===== UNIVERSAL CONVERSION (USD BASED) ===== */
    const usdValue = amount * prices[fromAsset];
    const receiveAmount = usdValue / prices[toAsset];

    // update balances
    user.balance[fromAsset] -= amount;
    user.balance[toAsset] =
      (user.balance[toAsset] || 0) + receiveAmount;

    await user.save();

    res.json({
      success: true,
      from: fromAsset,
      to: toAsset,
      amount,
      received: receiveAmount,
      rate: prices[fromAsset] / prices[toAsset],
      balance: user.balance,
    });

  } catch (err) {
    console.error("Swap Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
