// netlify/functions/ask-yb.js
// Public path for the function:
export const config = { path: "/ask-yb" }; // -> /.netlify/functions/ask-yb

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 600;

function companyContext(lang = "en") {
  const base = `
You are YB Intelligence, the assistant for YB Consulting.
We combine field investigation + AI/BI to: Detect (weak signals & irregularities), Handle (structure the case into clarity), Secure (prevent recurrence with fixes).
Regions: Belgium, France, Luxembourg, Netherlands, Germany, Switzerland, Spain.
Registered in Geneva, Switzerland — 2 bis rue Saint Léger, 1205 Genève.
Primary contact: ybconsult.ai@proton.me • Website: ybconsulting.ai
Never invent prices or legal outcomes. Encourage contact when the question needs specifics.
`;
  const locale =
    {
      fr: "Réponds en français si possible. Style: clair, professionnel, concis.",
      de: "Bitte auf Deutsch antworten, klar und professionell.",
      es: "Responde en español de forma clara y profesional.",
      en: "Respond in clear, professional English.",
    }[lang] || "Respond in clear, professional English.";
  return `${base}\n${locale}`;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Use POST" });
  }

  try {
    const { messages = [], lang = "en", page = "/" } = parse(event.body);

    if (!Array.isArray(messages) || messages.length === 0) {
      return json(400, { error: "No messages" });
    }
    const userLast = String(messages[messages.length - 1]?.content || "");
    if (userLast.length > 4000) {
      return json(400, { error: "Message too long" });
    }

    const chat = [
      { role: "system", content: companyContext(lang) },
      {
        role: "system",
        content: `Current section: ${page}. If the user asks to contact, offer ybconsult.ai@proton.me. If the user wants services, map to Detect/Handle/Secure.`,
      },
      ...messages.slice(-20),
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: chat,
        temperature: 0.3,
        max_tokens: MAX_TOKENS,
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return json(500, { error: "OpenAI error", details: t });
    }
    const j = await r.json();
    const text = j?.choices?.[0]?.message?.content?.trim() || "…";

    return json(200, { answer: text });
  } catch (e) {
    return json(500, { error: "Server error", details: String(e) });
  }
}

function parse(raw) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}
function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
