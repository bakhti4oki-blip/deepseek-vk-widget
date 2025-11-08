export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = await req.json();

    // Простейшая эмуляция ответа от DeepSeek
    const reply = `🤖 DeepSeek отвечает: "${message}"`;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Ошибка:", error);
    return res.status(500).json({ error: "Ошибка на сервере" });
  }
}
