module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse JSON body
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { message } = data;

        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Received message:', message);

        // AI responses
        const userMessage = message.toLowerCase();
        let reply;

        if (userMessage.includes('привет') || userMessage.includes('hello')) {
          reply = "🤖 Привет! Я DeepSeek AI ассистент. Рад вас видеть!";
        } else if (userMessage.includes('как дела')) {
          reply = "🤖 У меня всё отлично! Готов помогать вам.";
        } else if (userMessage.includes('спасибо')) {
          reply = "🤖 Пожалуйста! Обращайтесь ещё!";
        } else {
          const replies = [
            `Интересный вопрос: "${message}". Я AI-ассистент и постоянно учусь!`,
            `Спасибо за сообщение: "${message}". Стараюсь быть полезным!`,
            `По вопросу "${message}" могу сказать, что это требует изучения.`,
            `Запрос "${message}" получен. Как AI-ассистент, я развиваюсь!`
          ];
          reply = replies[Math.floor(Math.random() * replies.length)];
        }

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 800));

        res.status(200).json({
          reply: reply,
          success: true
        });

      } catch (parseError) {
        console.error('Parse error:', parseError);
        res.status(400).json({ error: 'Invalid JSON' });
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
