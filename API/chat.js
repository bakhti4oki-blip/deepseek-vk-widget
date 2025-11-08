export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Сообщение обязательно' });
    }

    // Временная заглушка пока нет лицензии DeepSeek
    const replies = [
      "Привет! Я DeepSeek AI ассистент. В настоящее время настраиваюсь для работы с сообществом.",
      "Спасибо за ваше сообщение! Скоро я буду полностью функционален.",
      "ИИ-ассистент в процессе настройки. Возвращайтесь позже!",
      "Рад общению! В данный момент прохожу финальные настройки."
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    const reply = `🤖 ${randomReply}\n\n(Ваше сообщение: "${message}")`;

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Ошибка:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
