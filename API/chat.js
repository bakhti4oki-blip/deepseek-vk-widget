const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message' });

  const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL;
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  if (!DEEPSEEK_API_URL || !DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'Server not configured: missing DEEPSEEK variables' });
  }

  try {
    const payload = { input: message };
    const r = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'DeepSeek error', detail: text });
    }

    const json = await r.json();
    const reply = json.reply || json.output || (json.choices && json.choices[0] && (json.choices[0].text || json.choices[0].message?.content)) || JSON.stringify(json);
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
