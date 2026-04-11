const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const extractResponseText = (responseJson) => {
  const parts = responseJson?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
};

const parseModerationJson = (rawText) => {
  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    const match = rawText.match(/\{[\s\S]*\}/);

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch (innerError) {
      return null;
    }
  }
};

const moderateMessageWithGemini = async (messageText) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `
You are a strict chat safety classifier for a social messaging app.
Analyze the message below and reply ONLY as valid JSON.

Return this shape:
{
  "isUnsafe": boolean,
  "shouldBlock": boolean,
  "reason": string,
  "categories": string[]
}

Mark shouldBlock true if the message contains harassment, hate, threats, sexual abuse, stalking, scam attempts, blackmail, or dangerous abuse.
Message:
"""${messageText}"""
`.trim();

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(
      responseJson?.error?.message || "Gemini moderation request failed"
    );
  }

  const parsed = parseModerationJson(extractResponseText(responseJson));

  if (!parsed) {
    throw new Error("Gemini returned an unreadable moderation response");
  }

  return {
    isUnsafe: Boolean(parsed.isUnsafe),
    shouldBlock: Boolean(parsed.shouldBlock),
    reason: parsed.reason || "Unsafe content detected",
    categories: Array.isArray(parsed.categories) ? parsed.categories : [],
  };
};

module.exports = {
  moderateMessageWithGemini,
};
