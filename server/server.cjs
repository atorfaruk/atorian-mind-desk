require("dotenv").config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const express = require("express");
const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const resolveCoinGeckoAssetId = async (symbol) => {
  const base = String(symbol || "")
    .toUpperCase()
    .replace(/(USDT|USDC|BUSD|USD|TUSD|FDUSD|PERP)$/, "")
    .trim();

  if (!base) return null;

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(base)}`
    );

    if (!response.ok) return null;

    const result = await response.json();
    const coins = Array.isArray(result.coins) ? result.coins : [];

    const exact = coins.find(
      (coin) =>
        String(coin.symbol || "").toUpperCase() === base
    );

    return exact?.id || null;
  } catch {
    return null;
  }
};

async function fetchCoinGeckoReference(symbol) {
  const assetId = await resolveCoinGeckoAssetId(symbol);

  if (!assetId) {
    return null;
  }

  try {
    const response = await fetch(
     `https://api.coingecko.com/api/v3/simple/price?ids=${assetId}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data?.[assetId]?.usd && data?.[assetId]?.usd !== 0) {
      return null;
    }

    return {
      source: "coingecko",
      symbol: assetId,
      currency: "usd",
      price: data[assetId].usd,
      change24h: data[assetId].usd_24h_change,
    };
  } catch (error) {
    console.warn("CoinGecko reference fetch failed:", error.message);
    return null;
  }
};

const fetchWithRetry = async (url, options) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, options);

      if (
        response.ok ||
        ![429, 500, 502, 503, 504].includes(response.status) ||
        attempt === 3
      ) {
        return response;
      }

      await new Promise((resolve) =>
        setTimeout(resolve,Math.min(7000, 2000 * 2 ** (attempt - 1)))
      );
    } catch (error) {
  if (attempt === 3) {
    throw error;
  }

  await new Promise((resolve) =>
    setTimeout(resolve, Math.min(7000, 2000 * 2 ** (attempt - 1)))
  );
}
}
  }
;
app.get("/", (req, res) => {
  res.json({ message: "Bitget AI Trading Desk server is running." });
});
app.get("/api/market", async (req, res) => {
  const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();

  try {
   const reference = await fetchCoinGeckoReference(symbol);

if (!reference) {
  return res.status(200).json({
    code: "00000",
    data: [],
    reference: null,
    message: "CoinGecko reference unavailable"
  });
}

res.json({
  code: "00000",
  data: [
    {
      symbol,
      last: String(reference.price),
      change24h: String(reference.change24h),
    },
  ],
  reference,
});
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});
app.post("/api/analyze", async (req, res) => {
  const { question, market } = req.body;
try {
  const prompt = `
You are an AI Trading Desk research assistant.

Analyze the market information provided below.
Give a concise, neutral research explanation.
Use plain text only.

User question:
${question}

Live market data:
${JSON.stringify(market)}
`;

  const response = await fetch("http://127.0.0.1:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt,
      stream: false,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({
      error: data?.error || "Ollama request failed.",
    });
  }

  const text = data?.response || "No AI analysis was returned.";

  res.json({ analysis: text });
} catch (error) {
  console.error("Ollama error:", error);

  res.status(500).json({
    error: "Unable to generate AI analysis.",
  });
}
  
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
module.exports = app;