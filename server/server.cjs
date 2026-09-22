require("dotenv").config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const express = require("express");
const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
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
        setTimeout(resolve, 1000 * attempt)
      );
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * attempt)
      );
    }
  }
};
app.get("/", (req, res) => {
  res.json({ message: "Bitget AI Trading Desk server is running." });
});
app.get("/api/market", async (req, res) => {
  const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();

  try {
    const response = await fetch(
      `https://api.bitget.com/api/v3/market/tickers?category=SPOT&symbol=${symbol}`
    );

    const data = await response.json();

    res.json(data);
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
    const response = await fetchWithRetry(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an AI Trading Desk research assistant.
Analyze the market information provided below.
Give a concise, neutral research explanation.
Do not give financial advice or tell the trader to buy or sell.

User question:
${question}

Live market data:
${JSON.stringify(market)}
`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

console.log("Gemini response:", JSON.stringify(data, null, 2));

if (!response.ok) {
  return res.status(response.status).json({
    error: data?.error?.message || "Gemini API request failed."
  });
}

const text =
  data?.candidates?.[0]?.content?.parts?.[0]?.text ||
  "No AI analysis was returned.";

res.json({ analysis: text });
  } catch (error) {
    console.error("Gemini error:", error.cause || error);

    res.status(500).json({
      error: "Unable to generate AI analysis.",
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});