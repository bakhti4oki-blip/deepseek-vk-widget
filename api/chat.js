import fetch from 'node-fetch';

export default async function handler(req, res) {
  console.log('API called with method:', req.method);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request handled');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    console.log('Received message:', message);

    if (!message) {
      console.log('No message provided');
      return res.status(400).json({ error: 'Message is required' });
    }

    // Проверяем наличие API ключа
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    console.log('DeepSeek API Key available:', !!DEEPSEEK_API_KEY);

    let reply;

    if (DEEPSEEK_API_KEY) {
      console.log('Using real DeepSeek API');
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'Ты полезный AI-ассистент для сообщества ВКонтакте о вахтовой работе в Уфе и Башкирии. Отвечай кратко и по делу на русском языке.'
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        });

        console.log('DeepSeek API response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('DeepSeek API success');
          reply = result.choices[0]?.message?.content || 'Не удалось получить ответ от DeepSeek';
        } else {
          console.error('DeepSeek API error:', response.status, await response.text());
          reply = getLocalResponse(message);
        }
      } catch (apiError) {
        console.error('DeepSeek API request failed:', apiError);
        reply = getLocalResponse(message);
      }
    } else {
      console.log('Using local responses (no API key)');
      reply = getLocalResponse(message);
    }

    console.log('Sending reply:', reply.substring(0, 50) + '...');
    
    return res.status(200).json({
      reply: reply,
      success: true,
      source: DEEPSEEK_API_KEY ? 'deepseek-api' : 'local'
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Локальные ответы для fallback
function getLocalResponse(message) {
  const userMessage = message.toLowerCase();
  
  if (userMessage.includes('привет') || userMessage.includes('hello')) {
    return "Привет! Я DeepSeek AI ассистент. Чем могу помочь с вопросами о вахтовой работе?";
  } else if (userMessage.includes('вахт') || userMessage.includes('работ')) {
    return "По вопросам вахтовой работы могу помочь с информацией о вакансиях, условиях труда в Уфе и Башкирии.";
  } else if (userMessage.includes('уфа') || userMessage.includes('башкир')) {
    return "В Уфе и Башкирии доступны вахтовые вакансии в строительстве, нефтегазовой отрасли и на производстве.";
  } else if (userMessage.includes('deepseek') || userMessage.includes('api')) {
    return "Сейчас я работаю в тестовом режиме. Скогда будет настроен DeepSeek API, я стану еще умнее!";
  } else {
    const replies = [
      `Спасибо за вопрос о "${message}". Как AI-ассистент, я специализируюсь на помощи с вахтовой работой.`,
      `Интересный вопрос! "${message}" - это важно для обсуждения в нашем сообществе.`,
      `По теме "${message}" могу сказать, что это связано с вопросами трудоустройства и условий работы.`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
}
