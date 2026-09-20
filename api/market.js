export default async function handler(req, res) {
  const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();

  try {
    const response = await fetch(
      `https://api.bitget.com/api/v3/market/tickers?category=SPOT&symbol=${symbol}`
    );

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}