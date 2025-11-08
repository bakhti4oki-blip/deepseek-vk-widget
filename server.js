const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Для реального DeepSeek API
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key-here';

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

        if (!message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Message is required' }));
          return;
        }

        console.log('Received message:', message);

        // Реальный DeepSeek API
        let reply;
        if (DEEPSEEK_API_KEY && DEEPSEEK_API_KEY !== 'your-deepseek-api-key-here') {
          try {
            const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
                    content: 'Ты полезный AI-ассистент для сообщества ВКонтакте о вахтовой работе в Уфе и Башкирии. Отвечай кратко и по делу.'
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

            if (deepseekResponse.ok) {
              const result = await deepseekResponse.json();
              reply = result.choices[0]?.message?.content || 'Не удалось получить ответ от DeepSeek';
            } else {
              throw new Error('DeepSeek API error');
            }
          } catch (apiError) {
            console.error('DeepSeek API error:', apiError);
            // Fallback to local responses
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
        console.error('Error:', error);
        res.writeHead(500, { 
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({ 
          error: 'Internal server error',
          message: 'Попробуйте еще раз'
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
      '.js': 'application/javascript; charset=utf-8'
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
  
  if (userMessage.includes('привет') || userMessage.includes('hello')) {
    return "Привет! Я DeepSeek AI ассистент. Чем могу помочь с вопросами о вахтовой работе?";
  } else if (userMessage.includes('вахт') || userMessage.includes('работ')) {
    return "По вопросам вахтовой работы в Уфе и Башкирии могу помочь с информацией о вакансиях, условиях труда и требованиях к соискателям.";
  } else if (userMessage.includes('условия') || userMessage.includes('зарплат')) {
    return "Условия вахтовой работы обычно включают: проживание, питание, транспортные расходы. Зарплата зависит от специальности и опыта.";
  } else if (userMessage.includes('требован')) {
    return "Основные требования: опыт работы, необходимые квалификации, медицинская книжка, готовность к работе вахтовым методом.";
  } else {
    const replies = [
      `По вопросу "${message}" могу сказать, что это связано с вахтовой работой. Уточните, пожалуйста, что именно вас интересует.`,
      `Интересующий вас вопрос "${message}" требует уточнения деталей о вахтовой работе в Уфе.`,
      `В рамках вахтовой работы в Башкирии вопрос "${message}" является актуальным. Нужны дополнительные детали.`
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`DeepSeek API Key: ${DEEPSEEK_API_KEY ? 'Configured' : 'Not configured'}`);
});
