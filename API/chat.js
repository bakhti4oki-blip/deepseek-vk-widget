export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Заглушка пока нет API ключа DeepSeek
    const replies = [
      "Привет! Я DeepSeek AI ассистент. Чем могу помочь?",
      "Отличный вопрос! В настоящее время я настраиваюсь для работы.",
      "Спасибо за сообщение! Скоро я буду полностью функционален.",
      "ИИ-ассистент в процессе настройки. Задавайте вопросы!",
      "Рад общению! Сейчас прохожу финальные настройки."
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return res.status(200).json({ 
      reply: `🤖 ${randomReply}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
