// netlify/functions/ask-yb.js
// Safe version: no custom path config; use default /.netlify/functions/ask-yb
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 600;

function parseJSON(raw) { try { return JSON.parse(raw || "{}"); } catch { return {}; } }
function json(status, body, extra = {}) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...extra,
    },
    body: JSON.stringify(body),
  };
}

function companyContext(lang = "en") {
  const base = `You are YB Intelligence, the assistant for YB Consulting.
We combine field investigation + AI/BI to: Detect (weak signals & irregularities), Handle (structure the case into clarity), Secure (prevent recurrence with fixes).
Regions: Belgium, France, Luxembourg, Netherlands, Germany, Switzerland, Spain.
Email: ybconsult.ai@proton.me — Site: ybconsulting.ai`;
  const locale = ({fr:"Réponds en français.",de:"Bitte auf Deutsch antworten.",es:"Responde en español.",en:"Respond in English."}[lang] || "Respond in English.");
  return `${base}\n${locale}`;
}

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Use POST" });
  }
  if (!OPENAI_API_KEY) {
    return json(500, { error: "Missing OPENAI_API_KEY in environment" });
  }

  try {
    const body = parseJSON(event.body);
    const lang = body.lang || "en";
    const messages = Array.isArray(body.messages) ? body.messages
                     : (body.question ? [{ role: "user", content: String(body.question) }] : null);
    if (!messages || messages.length === 0) {
      return json(400, { error: "Send {question} or {messages:[...]}" });
    }

    const chat = [
      { role: "system", content: companyContext(lang) },
      ...messages.slice(-20),
    ];

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: MODEL, messages: chat, temperature: 0.3, max_tokens: MAX_TOKENS }),
    });

    const text = await resp.text();
    if (!resp.ok) {
      // bubble up detailed error from OpenAI (helps debugging)
      return json(502, { error: "Upstream error", details: text });
    }
    const data = JSON.parse(text);
    const answer = data?.choices?.[0]?.message?.content?.trim() || "…";
    return json(200, { answer });
  } catch (e) {
    return json(500, { error: "Server error", details: String(e?.message || e) });
  }
};
