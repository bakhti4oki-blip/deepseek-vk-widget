const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Для реального DeepSeek API
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API endpoint
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { message } = data;

        if (!message || typeof message !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message is required' }));
          return;
        }

        console.log('Received message:', message);

        let reply;
        
        // Используем реальный DeepSeek API если ключ есть
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

        res.writeHead(200, { 
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          reply: reply,
          success: true
        }));

      } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500, { 
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({ 
          error: 'Internal server error'
        }));
      }
    });
    return;
  }

  // Serve static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, 'public', filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found, serve index.html for SPA
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('Not Found');
          } else {
            res.writeHead(200, { 
              'Content-Type': 'text/html; charset=utf-8'
            });
            res.end(data);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error');
      }
      return;
    }

    // Set content type
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.ico': 'image/x-icon'
    };

    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'text/plain'
    });
    res.end(data);
  });
});

// Локальные ответы для fallback
function getLocalResponse(message) {
  const userMessage = message.toLowerCase();
  
  if (userMessage.includes('привет') || userMessage.includes('hello') || userMessage.includes('hi')) {
    return "Привет! Я DeepSeek AI ассистент. Чем могу помочь с вопросами о вахтовой работе в Уфе и Башкирии?";
  } else if (userMessage.includes('вахт') || userMessage.includes('работ')) {
    return "По вопросам вахтовой работы могу помочь с информацией о вакансиях, условиях труда и требованиях к соискателям в Уфе и Башкирии.";
  } else if (userMessage.includes('условия') || userMessage.includes('зарплат')) {
    return "Условия вахтовой работы обычно включают: проживание, питание, транспорт. Зарплата зависит от специальности, опыта и компании.";
  } else if (userMessage.includes('требован')) {
    return "Основные требования: опыт работы, квалификация, медицинская книжка, готовность к работе вахтовым методом.";
  } else if (userMessage.includes('уфа') || userMessage.includes('башкир')) {
    return "В Уфе и Башкирии много вахтовых вакансий в сферах: строительство, нефтегазовая отрасль, производство.";
  } else {
    const replies = [
      `Спасибо за ваш вопрос о "${message}". Как AI-ассистент, я специализируюсь на помощи с вахтовой работой в Уфе.`,
      `Интересный вопрос! "${message}" - это важно для обсуждения в контексте вахтовой работы.`,
      `По теме "${message}" могу сказать, что это связано с вопросами трудоустройства и условий работы.`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (DEEPSEEK_API_KEY) {
    console.log('DeepSeek API: Configured');
  } else {
    console.log('DeepSeek API: Using local responses (no API key)');
  }
});
