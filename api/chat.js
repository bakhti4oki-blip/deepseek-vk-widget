import fetch from 'node-fetch';

export default async function handler(req, res) {
  console.log('API called with method:', req.method);
  
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
    console.log('Received message:', message);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    let reply;
    let source = 'local';

    // Пробуем использовать DeepSeek API если ключ есть
    if (DEEPSEEK_API_KEY) {
      try {
        console.log('Trying DeepSeek API...');
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
                content: 'Ты полезный AI-ассистент для сообщества ВКонтакте о вахтовой работе в Уфе и Башкирии. Отвечай кратко и по делу на русском языке. Фокусируйся на вопросах работы, вахты, трудоустройства.'
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
          reply = result.choices[0]?.message?.content;
          source = 'deepseek-api';
          console.log('Successfully used DeepSeek API');
        } else {
          const errorText = await response.text();
          console.log('DeepSeek API failed, using local responses:', errorText);
          reply = getLocalResponse(message);
        }
      } catch (apiError) {
        console.log('DeepSeek API error, using local responses:', apiError.message);
        reply = getLocalResponse(message);
      }
    } else {
      console.log('No API key, using local responses');
      reply = getLocalResponse(message);
    }

    return res.status(200).json({
      reply: reply,
      success: true,
      source: source
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}

// Улучшенные локальные ответы
function getLocalResponse(message) {
  const userMessage = message.toLowerCase().trim();
  
  // Приветствия
  if (userMessage.includes('привет') || userMessage.includes('здравств') || userMessage.includes('hello') || userMessage.includes('hi')) {
    return "Привет! Я AI-ассистент DeepSeek. Помогаю с вопросами о вахтовой работе в Уфе и Башкирии. Чем могу помочь?";
  }
  
  // Вопросы о работе
  if (userMessage.includes('вахт') || userMessage.includes('работ')) {
    if (userMessage.includes('услов') || userMessage.includes('условия')) {
      return "Условия вахтовой работы обычно включают: проживание в вахтовом поселке, питание, транспорт до места работы. График часто 15/15 или 30/30 дней. Зарплата выше средней по региону.";
    }
    if (userMessage.includes('зарплат') || userMessage.includes('оплат') || userMessage.includes('доход')) {
      return "Зарплата на вахте зависит от специальности: разнорабочие от 45,000₽, сварщики от 80,000₽, машинисты от 70,000₽, инженеры от 90,000₽. Оплата обычно сдельная+премии.";
    }
    if (userMessage.includes('требован') || userMessage.includes('нужн') || userMessage.includes('необход')) {
      return "Основные требования: паспорт, трудовая книжка, медицинская справка 086/у, СНИЛС, ИНН. Для некоторых специальностей - удостоверения и допуски.";
    }
    if (userMessage.includes('график') || userMessage.includes('смен') || userMessage.includes('режим')) {
      return "Стандартные графики вахты: 15/15 (15 рабочих, 15 выходных), 30/30, 60/30. Рабочий день обычно 10-12 часов с перерывом на обед.";
    }
    if (userMessage.includes('ваканс') || userMessage.includes('свободн') || userMessage.includes('набор')) {
      return "Сейчас есть вакансии: разнорабочие, сварщики, электромонтажники, машинисты техники, водители категории С. Подробности у администратора сообщества.";
    }
    return "По вахтовой работе могу рассказать о: вакансиях, условиях труда, зарплате, требованиях к соискателям, графике работы. Что конкретно вас интересует?";
  }
  
  // Вопросы об Уфе и Башкирии
  if (userMessage.includes('уфа') || userMessage.includes('башкир') || userMessage.includes('республ')) {
    if (userMessage.includes('компан') || userMessage.includes('работодат')) {
      return "В Уфе и Башкирии основные работодатели: нефтегазовые компании, строительные организации, промышленные предприятия. Популярны вахты в СИБУРе, Башнефти, строительных холдингах.";
    }
    if (userMessage.includes('проезд') || userMessage.includes('транспорт') || userMessage.includes('добира')) {
      return "Проезд до места вахты обычно оплачивает работодатель. Из Увы организуют автобусы до вахтовых поселков. Для дальних объектов - авиа или ж/д билеты.";
    }
    return "В Уфе и Башкирии много вахтовых вакансий в строительстве, нефтегазовой отрасли, на промышленных предприятиях. Регион активно развивается, много новых проектов.";
  }
  
  // Общие вопросы
  if (userMessage.includes('жиль') || userMessage.includes('проживан') || userMessage.includes('общежит')) {
    return "Проживание предоставляется в вахтовых поселках - это модульные городки с комнатами на 2-4 человека. Есть душевые, столовая, прачечная, иногда спортзал.";
  }
  
  if (userMessage.includes('питание') || userMessage.includes('еда') || userMessage.includes('столов')) {
    return "Питание обычно организовано в столовой, 3-4 раза в день. Стоимость питания часто включена в соцпакет или предоставляется скидка.";
  }
  
  if (userMessage.includes('опыт') || userMessage.includes('стаж') || userMessage.includes('навык')) {
    return "Требования к опыту зависят от должности: для разнорабочих часто берут без опыта, для специалистов - от 1-3 лет. Обучение проводится на месте.";
  }
  
  if (userMessage.includes('документ') || userMessage.includes('справк') || userMessage.includes('оформлен')) {
    return "Для оформления нужны: паспорт, трудовая, СНИЛС, ИНН, медсправка 086/у, военный билет (для военнообязанных). Документы проверяет отдел кадров.";
  }
  
  // Случайные вопросы
  const responses = [
    `По вопросу "${message}" - это интересная тема! В контексте вахтовой работы могу сказать, что важно уточнить детали у работодателя.`,
    `Спасибо за вопрос о "${message}"! В нашем сообществе мы помогаем с трудоустройством на вахту - обращайтесь к администратору для консультации.`,
    `"${message}" - хороший вопрос! Для точного ответа нужно знать конкретную специальность и условия работы. Можете уточнить?`,
    `По теме "${message}" могу посоветовать обратиться к менеджеру по подбору - они подробно расскажут о текущих вакансиях и условиях.`,
    `Интересующий вас вопрос "${message}" требует индивидуального подхода. В нашем сообществе помогут найти подходящую вахтовую работу!`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
