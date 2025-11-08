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
    // Правильно парсим тело запроса для Vercel
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else if (req.body) {
      body = req.body;
    } else {
      // Для Vercel Serverless Functions
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString();
      body = JSON.parse(rawBody);
    }

    const { message } = body;

    if (!message) {
      return res.status(400).json({ error: 'Сообщение обязательно' });
    }

    // Улучшенная заглушка с разными типами ответов
    const greetings = ['привет', 'здравствуй', 'добрый', 'hello', 'hi', 'начать'];
    const isGreeting = greetings.some(greet => message.toLowerCase().includes(greet));

    let reply;
    if (isGreeting) {
      reply = "🤖 Привет! Я DeepSeek AI ассистент. Задавайте вопросы, и я постараюсь помочь!";
    } else if (message.length < 3) {
      reply = "🤖 Пожалуйста, напишите более развернутый вопрос.";
    } else {
      const replies = [
        `Интересный вопрос о "${message}". В настоящее время я настраиваю интеграцию с DeepSeek API.`,
        `Спасибо за ваш запрос! "${message}" - это важная тема. Скоро я буду полностью функционален.`,
        `По вопросу "${message}" могу сказать, что как AI-ассистент я еще обучаюсь. Возвращайтесь позже!`,
        `Запрос "${message}" получен. В ближайшее время я буду обрабатывать такие вопросы с помощью DeepSeek AI.`,
        `Отличный вопрос! По теме "${message}" скоро смогу давать более точные ответы.`
      ];
      reply = "🤖 " + replies[Math.floor(Math.random() * replies.length)];
    }

    // Имитация обработки AI
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    return res.status(200).json({ 
      reply: reply,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Внутренняя ошибка сервера',
      message: 'Попробуйте еще раз через несколько секунд'
    });
  }
}
