export default async (req) => {
  try {
    const { question } = JSON.parse(req.body || '{}');
    if (!question) return json({ error: 'Missing "question"' }, 400);

    const key = process.env.OPENAI_API_KEY;
    if (!key) return json({ error: 'OPENAI_API_KEY not set' }, 500);

    // Minimal call using Responses API (text)
    const r = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: `You are YB Consulting's assistant. Answer shortly, clearly, and professionally.\n\nUser: ${question}`
      })
    });
    const data = await r.json();
    const answer =
      data?.output_text ??
      data?.choices?.[0]?.message?.content ??
      '…';

    return json({ answer });
  } catch (err) {
    return json({ error: 'Server error' }, 500);
  }
};

const json = (obj, status = 200) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify(obj)
});
