export default async function handler(req, res) {
  // Настраиваем CORS для ВКонтакте
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Обрабатываем preflight запрос
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }

    const { message } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Упрощенный ответ (заглушка)
    const replies = [
      `Привет! Вы написали: "${message}". В настоящее время я настраиваю интеграцию с DeepSeek API.`,
      `Спасибо за ваше сообщение: "${message}"! Скоро я буду полностью функционален с искусственным интеллектом.`,
      `Отличный вопрос! "${message}" - это интересно. Я AI-ассистент в процессе настройки.`,
      `Запрос "${message}" получен. В ближайшее время я буду обрабатывать такие запросы с помощью DeepSeek AI.`
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    // Имитация обработки AI
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return res.status(200).json({ 
      reply: `🤖 ${randomReply}`,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
