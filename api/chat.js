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

    // Пробуем использовать DeepSeek API если ключ есть
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
    let reply;
    let source = 'local';

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
                content: 'Ты полезный AI-ассистент для сообщества ВКонтакте о вахтовой работе в Уфе и Башкирии. Отвечай кратко и по делу на русском языке. Форматируй ответы с четким разделением на блоки.'
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
          console.log('DeepSeek API failed, using local responses');
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

function getLocalResponse(message) {
  const userMessage = message.toLowerCase().trim();
  
  // Приветствия
  if (userMessage.includes('привет') || userMessage.includes('здравств') || userMessage.includes('hello') || userMessage.includes('hi') || userMessage === 'start') {
    return `👋 Приветствую! 

Я AI-помощник сообщества «Уфа Работа Вахта Башкирия».

📋 Чем могу помочь:
• Информация о вакансиях
• Условия работы и требования
• Документы для трудоустройства  
• Обучение с нуля
• Контакты работодателей

Задайте ваш вопрос — и я подробно отвечу!`;
  }
  
  // Информация о сообществе
  if (userMessage.includes('сообщество') || userMessage.includes('уфа работ') || userMessage.includes('башкирия') || userMessage.includes('о вас') || userMessage.includes('контакты')) {
    return `🏢 **СООБЩЕСТВО "УФА РАБОТА ВАХТА БАШКИРИЯ"**

━━━━━━━━━━━━━━━━━━━━
📋 **О НАС:**
• Актуальные вакансии вахтовым методом
• Проверенные работодатели
• Работа без посредников

👥 **ДЛЯ КОГО:**
• Соискатели — реальные предложения
• Работодатели — подбор специалистов

💬 **КОНТАКТЫ:**
Пишите напрямую в сообщество

🚀 **СКОРО:**
Полноценный AI-ассистент на DeepSeek`;
  }
  
  // Вакансии
  if (userMessage.includes('ваканс') || userMessage.includes('работа') || userMessage.includes('вахта') || userMessage.includes('трудоустрой') || userMessage.includes('изолиров')) {
    return `👷‍♂ **ВАКАНСИЯ: ИЗОЛИРОВЩИК ПРОМЫШЛЕННОГО ТРУБОПРОВОДА**

━━━━━━━━━━━━━━━━━━━━
💵 **ЗАРПЛАТА:** от 116 550 ₽ + премии
📅 **ГРАФИК:** 60 смен (возможно продление)

🎯 **ТРЕБОВАНИЯ:**
• Готовность к вахте
• Отсутствие медпротивопоказаний  
• Соблюдение норм безопасности
• Опыт НЕ требуется

🏆 **УСЛОВИЯ:**
• Белая зарплата
• Проживание + 3-разовое питание
• Оплачиваемая медкомиссия
• Обучение с нуля
• Спецодежда и инструменты
• Оплата проезда
• Официальное трудоустройство

━━━━━━━━━━━━━━━━━━━━
📞 **КОНТАКТЫ:** 8-960-999-51-14 (Мах)

💬 По вопросам трудоустройства пишите в сообщество!`;
  }
  
  // Документы
  if (userMessage.includes('документ') || userMessage.includes('паспорт') || userMessage.includes('снилс') || userMessage.includes('инн') || userMessage.includes('трудовая')) {
    return `📄 **ДОКУМЕНТЫ ДЛЯ ТРУДОУСТРОЙСТВА**

━━━━━━━━━━━━━━━━━━━━
✅ **ОБЯЗАТЕЛЬНЫЕ:**
• Паспорт гражданина РФ
• СНИЛС
• ИНН  
• Трудовая книжка
• Военный билет (для призывного возраста)
• Документ об образовании

━━━━━━━━━━━━━━━━━━━━
💊 **МЕДКОМИССИЯ:**
• Прохождение — БЕСПЛАТНО
• Оплачивает компания
• Независимо от результатов

💬 По всем вопросам документов — пишите в сообщество!`;
  }
  
  // Обучение
  if (userMessage.includes('обучен') || userMessage.includes('с нуля') || userMessage.includes('научить') || userMessage.includes('курс') || userMessage.includes('учиться')) {
    return `🎓 **ОБУЧЕНИЕ ИЗОЛИРОВЩИКА С НУЛЯ**

━━━━━━━━━━━━━━━━━━━━
📚 **ПРОГРАММА:**
• Учебный Центр Мытищи
• 6-7 дней обучения
• Теория + практика теплоизоляции

💰 **ФИНАНСИРОВАНИЕ:**
• Все расходы за счет компании
• Бесплатное обучение
• Затем трудоустройство

🎯 **РЕЗУЛЬТАТ:**
• Профессия изолировщика
• Зарплата от 116 550₽
• Карьерный рост

💬 Для записи на обучение — пишите в сообщество!`;
  }
  
  // Зарплата
  if (userMessage.includes('зарплат') || userMessage.includes('оплат') || userMessage.includes('доход') || userMessage.includes('зараб') || userMessage.includes('деньг')) {
    return `💵 **ЗАРПЛАТА ИЗОЛИРОВЩИКА**

━━━━━━━━━━━━━━━━━━━━
💰 **ОКЛАД:** от 116 550 рублей/месяц

📊 **ВЫПЛАТЫ:**
• Белая (официальная) зарплата
• Премии за перевыполнение плана
• Выплаты 2 раза в месяц
• Своевременные расчеты

💬 Уточнить детали по зарплате — пишите в сообщество!`;
  }
  
  // График
  if (userMessage.includes('график') || userMessage.includes('смен') || userMessage.includes('режим') || userMessage.includes('отпуск') || userMessage.includes('вахт')) {
    return `📅 **ГРАФИК РАБОТЫ**

━━━━━━━━━━━━━━━━━━━━
⏰ **ВАХТА:** 60 рабочих смен

🔄 **ОСОБЕННОСТИ:**
• Возможно продление по желанию
• Стандартный рабочий день
• Отдых между вахтами
• Четкое соблюдение графика

💬 По вопросам графика — обращайтесь в сообщество!`;
  }
  
  // Условия
  if (userMessage.includes('услов') || userMessage.includes('проживан') || userMessage.includes('питание') || userMessage.includes('проезд') || userMessage.includes('соцпакет')) {
    return `🏠 **СОЦИАЛЬНЫЙ ПАКЕТ**

━━━━━━━━━━━━━━━━━━━━
🎁 **ЧТО ПРЕДОСТАВЛЯЕТСЯ:**
• Проживание на время вахты
• 3-разовое горячее питание
• Проезд дом-объект-дом
• Медкомиссия за счет компании
• Бесплатное обучение
• Спецодежда и инструменты
• Официальное трудоустройство

💬 Детали по условиям — уточняйте в сообществе!`;
  }
  
  // Требования
  if (userMessage.includes('требован') || userMessage.includes('нужн') || userMessage.includes('необход') || userMessage.includes('опыт')) {
    return `📋 **ТРЕБОВАНИЯ К КАНДИДАТУ**

━━━━━━━━━━━━━━━━━━━━
✅ **ОСНОВНЫЕ:**
• Готовность работать вахтовым методом
• Отсутствие медицинских противопоказаний
• Соблюдение норм безопасности
• Ответственность и дисциплина

🎓 **ОБРАЗОВАНИЕ:**
• Опыт работы НЕ ТРЕБУЕТСЯ
• Обучение проводим с нуля
• Любое образование

👤 **ПРОЧЕЕ:**
• Возраст: от 18 лет
• Гражданство РФ

💬 По вопросам требований — пишите в сообщество!`;
  }
  
  // Контакты
  if (userMessage.includes('контакт') || userMessage.includes('телефон') || userMessage.includes('звон') || userMessage.includes('связь') || userMessage.includes('позвонить')) {
    return `📞 **КОНТАКТЫ ДЛЯ ТРУДОУСТРОЙСТВА**

━━━━━━━━━━━━━━━━━━━━
📱 **ТЕЛЕФОН:** 8-960-999-51-14
👤 **КОНТАКТНОЕ ЛИЦО:** Мах

━━━━━━━━━━━━━━━━━━━━
💬 **АЛЬТЕРНАТИВА:**
Напишите напрямую в наше сообщество 
«Уфа Работа Вахта Башкирия»

Мы ответим на все ваши вопросы!`;
  }
  
  // ОБРАБОТКА НЕИЗВЕСТНЫХ ВОПРОСОВ
  const fallbackResponses = [
    `🤔 **Интересный вопрос!**

К сожалению, я пока не могу дать точный ответ на этот вопрос.

🏢 **Рекомендую обратиться:**
Напишите напрямую в наше сообщество 
«Уфа Работа Вахта Башкирия»

Там вам обязательно помогут!`,

    `🎯 **Хороший вопрос!**

Для получения точной информации по этому вопросу:

💬 **Обратитесь в сообщество:**
Напишите в «Уфа Работа Вахта Башкирия»

Наши специалисты дадут квалифицированный ответ!`
  ];
  
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}
