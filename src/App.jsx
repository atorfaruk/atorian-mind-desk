import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [market, setMarket] = useState(null);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [news, setNews] = useState([]);
  const detectSymbol = (text) => {
  const match = text.match(
    /\b(?:ANALYZE|CHECK|REVIEW|LOOK AT)\s+([A-Z0-9]{2,15})(?:USDT)?\b/
  );

  if (!match) {
    return symbol;
  }

  return `${match[1]}USDT`;
};
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
useEffect(() => {
  const loadNews = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/news");
      const data = await response.json();

      setNews(data.news || []);
    } catch (error) {
      console.error("News error:", error);
    }
  };

  loadNews();
}, []);
const analyzeMarket = async () => {
  if (!question.trim()) {
    setAnalysis("Please enter a market question first.");
    return;
  }

 const text = question.toUpperCase();

const detectedSymbol = detectSymbol(text);

  const symbolsToFetch = [detectedSymbol];

  setSymbol(symbolsToFetch[0]);
  setAnalysis("AI is analyzing the live market data...");

  try {
    const marketResults = await Promise.all(
      symbolsToFetch.map(async (marketSymbol) => {
        const response = await fetch(
          `https://api.bitget.com/api/v3/market/tickers?category=SPOT&symbol=${marketSymbol}`
        );

        const data = await response.json();

        return {
          symbol: marketSymbol,
          data: data.data[0],
        };
      })
    );

    const primaryMarket = marketResults[0].data;
    setMarket(primaryMarket);

    const marketContext =
      marketResults.length === 1
        ? primaryMarket
        : Object.fromEntries(
            marketResults.map((item) => [
              item.symbol,
              item.data,
            ])
          );

    const response = await fetch(
      "http://localhost:3001/api/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          market: marketContext,
        }),
      }
    );

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
        <h1>Atorian Mind Desk</h1>
        <p>Research smarter. Stress-test decisions. You make the final call.</p>
      </header>

      <main>
        <section className="assistant">
          <h2>🤖 Atorian AI Assistant</h2>

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
{analysis && <p style={{ whiteSpace: "pre-wrap" }}>{analysis}</p>}

        </section>

        <section className="dashboard">
          <div className="card">
            <h3>📈 Market</h3>
            <p>{market?.symbol ? market.symbol.replace("USDT", "/USDT") : "Loading..."}</p>
<p>Price: ${market?.lastPrice || "Loading..."}</p>
<p>24h Change: {market ? `${(Number(market.price24hPcnt) * 100).toFixed(2)}%` : "Loading..."}</p>
          </div>

          <div className="card">
  <h3>🧠 Market Intelligence</h3>
<p>
  {analysis || "Run an AI market analysis to generate intelligence."}
</p>

<p>
  • 24h price movement:{" "}
  {market
    ? `${(Number(market.price24hPcnt) * 100).toFixed(2)}%`
    : "Loading..."}
</p>

<p>
  • AI research context is based on the latest available market conditions.
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
            <p>
  <strong>Stress Test Insight:</strong>{" "}
  A 10% downside scenario would move the current price to{" "}
  {market
    ? `$${(Number(market.lastPrice) * 0.90).toFixed(2)}`
    : "..."}.
  This scenario helps assess how sensitive a potential setup may be
  to adverse price movement.
</p>
            {market ? (
  <div>
    <p>Current Price: ${Number(market.lastPrice).toFixed(2)}</p>
<p>-10% Downside: ${(Number(market.lastPrice) * 0.90).toFixed(2)}</p>
<p>-5% Downside: ${(Number(market.lastPrice) * 0.95).toFixed(2)}</p>
<p>+5% Upside: ${(Number(market.lastPrice) * 1.05).toFixed(2)}</p>
<p>+10% Upside: ${(Number(market.lastPrice) * 1.10).toFixed(2)}</p>
<h4>Stress Test Summary</h4>
<p>
  {Math.abs(Number(market.price24hPcnt)) >= 0.05
    ? "The market is showing a large 24-hour move. Wider downside and upside scenarios should be considered during stress testing."
    : Math.abs(Number(market.price24hPcnt)) >= 0.02
    ? "The market is showing a moderate 24-hour move. These scenarios help examine how the decision could behave under different price conditions."
    : "The market is showing a relatively small 24-hour move. These scenarios provide a baseline for testing potential price changes."}
</p>
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