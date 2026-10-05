export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const { question, market } = req.body;

 const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!GROQ_API_KEY && !GEMINI_API_KEY && !OPENROUTER_API_KEY) {
  return res.status(500).json({
    error: "No AI provider is configured.",
  });
}
  const buildPrompt = () => `
You are an AI Trading Desk research assistant.

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
    "whatToWatch": "The most important thing to monitor next."
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
`;

  const parseAIResult = (rawText) => {
    if (!rawText) {
      throw new Error("AI returned an empty response.");
    }

    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  };

  try {
    let result = null;
    let provider = "Gemini";

    // 1. Try Groq first
    if (GROQ_API_KEY) {
      try {
        const groqResponse = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-20b",
              response_format: {
                type: "json_object",
              },
              messages: [
                {
                  role: "system",
                  content: buildPrompt(),
                },
              ],
            }),
          }
        );

        const groqData = await groqResponse.json();

        if (groqResponse.ok) {
          const rawText =
            groqData?.choices?.[0]?.message?.content || "";

          if (rawText) {
            result = parseAIResult(rawText);
          }
        }

        if (!result) {
          console.log(
            "Groq unavailable. Switching to Gemini fallback."
          );
        }
      } catch (groqError) {
        console.log(
          "Groq failed. Switching to Gemini fallback:",
          groqError.message
        );
      }
    }
// 2. OpenRouter fallback
if (!result && OPENROUTER_API_KEY) {
  try {
    provider = "OpenRouter";

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            {
              role: "system",
              content: buildPrompt(),
            },
          ],
          response_format: {
            type: "json_object",
          },
        }),
      }
    );

    const openRouterData = await openRouterResponse.json();

    if (openRouterResponse.ok) {
      const rawText =
        openRouterData?.choices?.[0]?.message?.content || "";

      if (rawText) {
        result = parseAIResult(rawText);
      }
    } else {
      console.log(
        "OpenRouter failed:",
        openRouterData?.error?.message || "Unknown error"
      );
    }
  } catch (openRouterError) {
    console.log(
      "OpenRouter failed:",
      openRouterError.message
    );
  }
}
    // 3. Gemini fallback
    if (!result && GEMINI_API_KEY) {
      provider = "Gemini";

      const geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" +
          encodeURIComponent(GEMINI_API_KEY),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: buildPrompt(),
                },
              ],
            },
            generationConfig: {
              responseMimeType: "application/json",
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: buildPrompt(),
                  },
                ],
              },
            ],
          }),
        }
      );

      const geminiData = await geminiResponse.json();

      if (!geminiResponse.ok) {
        return res.status(geminiResponse.status).json({
          error:
            geminiData?.error?.message ||
            "Both AI providers failed.",
        });
      }

      const rawText =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      result = parseAIResult(rawText);
    }

    if (!result) {
      return res.status(503).json({
        error: "No AI provider returned a usable analysis.",
      });
    }

    return res.status(200).json({
      analysis:
        result.analysis ||
        "No AI analysis was returned.",
      signals: {
        marketSignal:
          result.signals?.marketSignal || "Neutral",
        momentum:
          result.signals?.momentum || "Mixed",
        keyCatalyst:
          result.signals?.keyCatalyst ||
          "No clear catalyst identified.",
        keyRisk:
          result.signals?.keyRisk ||
          "No clear risk identified.",
        confidence:
          result.signals?.confidence || "Low",
        whatToWatch:
          result.signals?.whatToWatch ||
          "Continue monitoring market conditions.",
      },
      provider,
    });
  } catch (error) {
    console.error("AI analysis error:", error);

    return res.status(500).json({
      error: "Unable to generate AI analysis.",
    });
  }
}