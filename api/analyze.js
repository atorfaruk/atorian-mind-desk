export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const { question, market } = req.body;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not configured.",
    });
  }

  try {
    let response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
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

Analyze the live market information and the user's research question.

Your job is to extract useful RESEARCH SIGNALS, not to make an automatic trading decision.

Return ONLY valid JSON. Do not use markdown or code fences.

Use exactly this structure:

{
  "analysis": "A concise neutral explanation of the market situation.",
  "signals": {
    "marketSignal": "Bullish, Bearish, or Neutral",
    "momentum": "Strong, Moderate, Weak, or Mixed",
    "keyCatalyst": "The most important observable factor.",
    "keyRisk": "The most important risk factor.",
    "confidence": "High, Medium, or Low",
    "whatToWatch": "The most important thing the trader should monitor next."
  }
}

Rules:
- Base the response only on the information provided.
- Do not invent news, events, prices, or data.
- Do not guarantee profits or outcomes.
- Do not give automatic buy/sell instructions.
- Keep the analysis concise and useful.
- The final trading decision belongs to the human trader.

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
        error:
          data?.error?.message || "Gemini API request failed.",
      });
    }

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let result;

    try {
      result = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw Gemini output:", rawText);

      return res.status(500).json({
        error: "AI returned an invalid research format.",
      });
    }

    return res.status(200).json({
      analysis: result.analysis || "No AI analysis was returned.",
      signals: {
        marketSignal: result.signals?.marketSignal || "Neutral",
        momentum: result.signals?.momentum || "Mixed",
        keyCatalyst:
          result.signals?.keyCatalyst || "No clear catalyst identified.",
        keyRisk:
          result.signals?.keyRisk || "No clear risk identified.",
        confidence: result.signals?.confidence || "Low",
        whatToWatch:
          result.signals?.whatToWatch ||
          "Continue monitoring market conditions.",
      },
    });
  } catch (error) {
    console.error("Gemini error:", error);

    return res.status(500).json({
      error: "Unable to generate AI analysis.",
    });
  }
}