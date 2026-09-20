import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [market, setMarket] = useState(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const markets = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "ADAUSDT",
  "AVAXUSDT",
  "LINKUSDT",
  "PEPEUSDT",
];
  useEffect(() => {
  const loadMarket = async () => {
    try {
      const response = await fetch(
        `https://api.bitget.com/api/v3/market/tickers?category=SPOT&symbol=${symbol}`
        
      );

      const data = await response.json();

      setMarket(data.data[0]);
    } catch (error) {
      console.error(error);
    }
  };

  loadMarket();
}, [symbol]);
const analyzeMarket = async () => {
  if (!question.trim()) {
    setAnalysis("Please enter a market question first.");
    return;
  }

  const text = question.toUpperCase();

  const detectedSymbol =
    markets.find((item) =>
      text.includes(item.replace("USDT", ""))
    ) || symbol;

  setSymbol(detectedSymbol);
  setAnalysis("AI is analyzing the live market data...");

  try {
    const marketResponse = await fetch(
      `https://api.bitget.com/api/v3/market/tickers?category=SPOT&symbol=${detectedSymbol}`
    );

    const marketData = await marketResponse.json();
    const freshMarket = marketData.data[0];

    setMarket(freshMarket);

    const response = await fetch("http://localhost:3001/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        market: freshMarket,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "AI analysis failed.");
    }

    setAnalysis(data.analysis);
  } catch (error) {
    console.error(error);
    setAnalysis("Unable to connect to the AI Trading Desk.");
  }
};

  
 
  return (
    <div className="app">
      <header>
        <h1>AI Trading Desk</h1>
        <p>Research smarter. Stress-test decisions. You make the final call.</p>
      </header>

      <main>
        <section className="assistant">
          <h2>🤖 AI Trading Assistant</h2>

          <p>
            Ask about a market, asset, setup, risk, or trading idea.
          </p>

          <textarea
            placeholder="Example: Analyze BTC and show me the key risks..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

        <button onClick={analyzeMarket}>
  Analyze Market
</button> 
{analysis && <p>{analysis}</p>} 

        </section>

        <section className="dashboard">
          <div className="card">
            <h3>📈 Market</h3>
            <p>{market?.symbol ? market.symbol.replace("USDT", "/USDT") : "Loading..."}</p>
<p>Price: ${market?.lastPrice || "Loading..."}</p>
<p>24h Change: {market ? `${(Number(market.price24hPcnt) * 100).toFixed(2)}%` : "Loading..."}</p>
          </div>

          <div className="card">
            <h3>📰 News</h3>
            <p>
  Live market data is connected.
  <br />
  News integration can be added later.
</p>
          </div>

          <div className="card">
            <h3>🛡️ Risk</h3>
            <p>
  {market ? (
  <>
    24h Movement: {(Number(market.price24hPcnt) * 100).toFixed(2)}%
    <br />
    Volatility:{" "}
    {Math.abs(Number(market.price24hPcnt)) >= 0.05
      ? "High"
      : Math.abs(Number(market.price24hPcnt)) >= 0.02
      ? "Moderate"
      : "Lower"}
    <br />
    Key Factor: Recent price movement
  </>
) : (
  "Waiting for market data..."
)}
</p>
          </div>

          <div className="card">
            <h3>🧪 Stress Test</h3>
            <h4>Scenario Comparison</h4>
            {market ? (
  <div>
    <p>Current: ${Number(market.lastPrice).toFixed(2)}</p>
    <p>-5% Scenario: ${(Number(market.lastPrice) * 0.95).toFixed(2)}</p>
    <p>+5% Scenario: ${(Number(market.lastPrice) * 1.05).toFixed(2)}</p>
  </div>
) : (
  <p>Waiting for market data...</p>
)}
    
          </div>
        </section>
      </main>
    </div>
  );
 }

export default App;