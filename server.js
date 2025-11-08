const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers для VK
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Важные заголовки для VK
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://vk.com');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://vk.com https://*.vk.com");

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

        // AI responses
        const userMessage = message.toLowerCase();
        let reply;

        if (userMessage.includes('привет') || userMessage.includes('hello') || userMessage.includes('hi')) {
          reply = "🤖 Привет! Я DeepSeek AI ассистент для сообщества ВКонтакте!";
        } else if (userMessage.includes('как дела') || userMessage.includes('how are you')) {
          reply = "🤖 У меня всё отлично! Готов помогать участникам сообщества.";
        } else if (userMessage.includes('спасибо') || userMessage.includes('thanks')) {
          reply = "🤖 Всегда пожалуйста! Обращайтесь ещё!";
        } else if (userMessage.includes('помощь') || userMessage.includes('help')) {
          reply = "🤖 Я AI-ассистент DeepSeek. Могу отвечать на вопросы, помогать с информацией и поддерживать беседу в вашем сообществе ВК!";
        } else if (userMessage.includes('вахт') || userMessage.includes('работ') || userMessage.includes('уфа')) {
          reply = "🤖 Я специализируюсь на помощи с вопросами о вахтовой работе в Уфе и Башкирии. Чем могу помочь?";
        } else {
          const replies = [
            `Интересный вопрос о "${message}". Как AI-ассистент, я постоянно учусь и развиваюсь!`,
            `Спасибо за сообщение: "${message}". Стараюсь быть полезным для участников сообщества!`,
            `По вопросу "${message}" могу сказать, что это требует внимательного изучения.`,
            `Запрос "${message}" получен. Развиваюсь как AI-ассистент для лучшей помощи!`,
            `Отличный вопрос! "${message}" - хорошая тема для обсуждения в сообществе.`
          ];
          reply = replies[Math.floor(Math.random() * replies.length)];
        }

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 600));

        res.writeHead(200, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          reply: reply,
          success: true,
          timestamp: new Date().toISOString()
        }));

      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ error: 'Internal server error' }));
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
              'Content-Type': 'text/html; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
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
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.ico': 'image/x-icon'
    };

    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to view the app`);
});
