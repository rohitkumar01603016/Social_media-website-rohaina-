const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_SUPPORT_ATTACHMENTS = 3;

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

const normalizeAttachment = (attachment) => {
  if (!attachment || typeof attachment !== "object") {
    return null;
  }

  const mimeType =
    typeof attachment.mimeType === "string" ? attachment.mimeType.trim() : "";
  const rawData =
    typeof attachment.data === "string" ? attachment.data.trim() : "";

  if (!mimeType || !rawData) {
    return null;
  }

  const dataMatch = rawData.match(/^data:([^;]+);base64,(.+)$/);
  const finalMimeType = dataMatch?.[1] || mimeType;
  const finalData = dataMatch?.[2] || rawData;

  if (!finalMimeType || !finalData) {
    return null;
  }

  return {
    inline_data: {
      mime_type: finalMimeType,
      data: finalData,
    },
  };
};

const askGeminiSupportAssistant = async ({ message, userName, attachments = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const attachmentParts = Array.isArray(attachments)
    ? attachments
        .slice(0, MAX_SUPPORT_ATTACHMENTS)
        .map(normalizeAttachment)
        .filter(Boolean)
    : [];

  const prompt = `
You are ROHAINA Support, a friendly in-app help assistant for a social networking platform.
Reply in plain text, keep answers practical and concise, and focus on helping users use the app.

Known ROHAINA features:
- Stories disappear after 24 hours.
- Opening a story should feel like an Instagram-style viewer.
- Story likes and viewer lists are only visible in full detail to the uploader.
- Chat supports unread indicators, online presence, emojis, media sharing, view-once photos, archived chats, and password-protected chats.
- Users can switch between light and dark mode.
- If a question needs account or moderation help, give safe next-step guidance.
- If screenshots are attached, inspect them carefully and use them in your answer.

User name: ${userName || "ROHAINA user"}
Question:
"""${message}"""
  `.trim();

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }, ...attachmentParts],
        },
      ],
      generationConfig: {
        temperature: 0.4,
      },
    }),
  });

  const rawText = await response.text();
  let responseJson = {};

  if (rawText) {
    try {
      responseJson = JSON.parse(rawText);
    } catch (error) {
      responseJson = {};
    }
  }

  if (!response.ok) {
    throw new Error(
      responseJson?.error?.message || "Gemini support request failed"
    );
  }

  const reply = extractResponseText(responseJson);

  if (!reply) {
    throw new Error("Gemini returned an empty support response");
  }

  return reply;
};

module.exports = {
  askGeminiSupportAssistant,
};
