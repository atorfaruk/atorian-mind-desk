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
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
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
Give a concise, neutral research explanation. Use plain text only.

User question:
${question}

Live market data:
${JSON.stringify(market)}`,
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

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI analysis was returned.";

    return res.status(200).json({
      analysis: text,
    });
  } catch (error) {
    console.error("Gemini error:", error);

    return res.status(500).json({
      error: "Unable to generate AI analysis.",
    });
  }
}