export default async function handler(request, response) {
  // Устанавливаем CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the request body
    const body = await parseBody(request);
    const { message } = body;

    if (!message) {
      return response.status(400).json({ error: 'Message is required' });
    }

    // Improved response logic
    let reply;
    const userMessage = message.toLowerCase().trim();

    if (userMessage.includes('привет') || userMessage.includes('hello') || userMessage.includes('hi')) {
      reply = "🤖 Привет! Я DeepSeek AI ассистент. Рад вас видеть! Чем могу помочь?";
    } else if (userMessage.includes('как дела') || userMessage.includes('как ты')) {
      reply = "🤖 У меня всё отлично! Я готов помогать вам с вопросами и задачами.";
    } else if (userMessage.includes('спасибо') || userMessage.includes('благодар')) {
      reply = "🤖 Пожалуйста! Всегда рад помочь. Обращайтесь ещё!";
    } else if (userMessage.includes('помощь') || userMessage.includes('help')) {
      reply = "🤖 Я AI-ассистент DeepSeek. Могу ответить на ваши вопросы, помочь с информацией или просто пообщаться!";
    } else {
      const randomReplies = [
        `Интересный вопрос! По теме "${message}" я могу сказать, что это требует внимательного изучения.`,
        `Спасибо за ваш запрос о "${message}". Как AI-ассистент, я постоянно учусь и улучшаю свои ответы.`,
        `По вопросу "${message}" могу отметить, что это важная тема для обсуждения.`,
        `Запрос "${message}" получен. В будущем я смогу давать более точные ответы на такие вопросы!`,
        `Отличный вопрос! "${message}" - это то, что действительно стоит обсудить.`
      ];
      reply = randomReplies[Math.floor(Math.random() * randomReplies.length)];
    }

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    return response.status(200).json({
      reply: reply,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return response.status(500).json({
      error: 'Internal server error',
      message: 'Please try again later'
    });
  }
}

// Helper function to parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}
