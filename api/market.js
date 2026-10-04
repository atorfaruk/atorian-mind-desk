const COINGECKO_ID_MAP = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  DOGE: "dogecoin",
  ADA: "cardano",
  ZEC: "zcash",
  LTC: "litecoin",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  UNI: "uniswap",
  NEAR: "near",
  ARB: "arbitrum",
  OP: "optimism",
  PEPE: "pepe",
  TRX: "tron",
  ATOM: "cosmos",
  ETC: "ethereum-classic",
  POL: "polygon-ecosystem-token",
};

const resolveCoinGeckoAssetId = (symbol) => {
  const raw = String(symbol || "").toUpperCase();
  if (!raw) return null;

  const base = raw.replace(/(USDT|USDC|USD|BUSD|TUSD|FDUSD|PERP)$/i, "");
  const id = COINGECKO_ID_MAP[base.toUpperCase()];
  return id || null;
};

const fetchCoinGeckoReference = async (symbol) => {
  const assetId = resolveCoinGeckoAssetId(symbol);

  if (!assetId) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${assetId}&vs_currencies=usd`
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
    };
  } catch (error) {
    console.warn("CoinGecko reference fetch failed:", error.message);
    return null;
  }
};

export default async function handler(req, res) {
  const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();

  try {
    const bitgetResponse = await fetch(
      `https://api.bitget.com/api/v3/market/tickers?category=SPOT&symbol=${symbol}`
    );

    const bitgetData = await bitgetResponse.json();
    const reference = await fetchCoinGeckoReference(symbol);

    res.status(200).json({
      ...bitgetData,
      reference,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}