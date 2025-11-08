export default async function handler(req, res) {
  // Устанавливаем CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse JSON body
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    const { message } = body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message:', message);

    // Improved AI responses
    const userMessage = message.toLowerCase();
    
    let reply;
    if (userMessage.includes('привет') || userMessage.includes('hello') || userMessage.includes('hi')) {
      reply = "🤖 Привет! Я DeepSeek AI ассистент. Рад вас видеть! Чем могу помочь?";
    } else if (userMessage.includes('как дела') || userMessage.includes('how are you')) {
      reply = "🤖 У меня всё отлично! Готов помогать вам с вопросами и задачами.";
    } else if (userMessage.includes('спасибо') || userMessage.includes('thanks')) {
      reply = "🤖 Пожалуйста! Всегда рад помочь. Обращайтесь ещё!";
    } else if (userMessage.includes('помощь') || userMessage.includes('help')) {
      reply = "🤖 Я AI-ассистент DeepSeek. Могу ответить на вопросы, помочь с информацией или просто пообщаться!";
    } else if (userMessage.includes('что ты умеешь') || userMessage.includes('what can you do')) {
      reply = "🤖 Я могу: отвечать на вопросы, помогать с информацией, поддерживать беседу, и многое другое!";
    } else {
      const responses = [
        `Интересный вопрос! "${message}" - хорошая тема для обсуждения.`,
        `Спасибо за ваш запрос о "${message}". Как AI-ассистент, я постоянно учусь и улучшаю свои ответы.`,
        `По вопросу "${message}" могу сказать, что это требует внимательного изучения.`,
        `Запрос "${message}" получен. Я обрабатываю информацию и стараюсь дать полезный ответ!`,
        `Отличный вопрос! "${message}" - это то, что действительно стоит обсудить.`
      ];
      reply = responses[Math.floor(Math.random() * responses.length)];
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    return res.status(200).json({
      reply: reply,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Please try again later'
    });
  }
}
