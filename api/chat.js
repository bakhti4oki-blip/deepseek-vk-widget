import fetch from 'node-fetch';

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
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message:', message);

    // Используем реальный DeepSeek API если ключ есть
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    let reply;

    if (DEEPSEEK_API_KEY) {
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

        if (response.ok) {
          const result = await response.json();
          reply = result.choices[0]?.message?.content || 'Не удалось получить ответ от DeepSeek';
        } else {
          console.error('DeepSeek API error:', response.status);
          reply = getLocalResponse(message);
        }
      } catch (apiError) {
        console.error('DeepSeek API request failed:', apiError);
        reply = getLocalResponse(message);
      }
    } else {
      // Локальные ответы если API ключ не настроен
      reply = getLocalResponse(message);
    }

    return res.status(200).json({
      reply: reply,
      success: true
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
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
  } else if (userMessage.includes('условия') || userMessage.includes('зарплат')) {
    return "Условия вахтовой работы обычно включают: проживание, питание, транспорт. Зарплата зависит от специальности и опыта.";
  } else {
    const replies = [
      `Спасибо за ваш вопрос о "${message}". Как AI-ассистент, я специализируюсь на помощи с вахтовой работой.`,
      `Интересный вопрос! "${message}" - это важно для обсуждения в контексте вахтовой работы.`,
      `По теме "${message}" могу сказать, что это связано с вопросами трудоустройства и условий работы.`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
}
