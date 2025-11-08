const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer(async (req, res) => {
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
  if (req.url === '/api/chat' && req.method === 'POST') {
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

        if (userMessage.includes('привет') || userMessage.includes('hello')) {
          reply = "🤖 Привет! Я DeepSeek AI ассистент. Рад вас видеть!";
        } else if (userMessage.includes('как дела')) {
          reply = "🤖 У меня всё отлично! Готов помогать вам.";
        } else if (userMessage.includes('спасибо')) {
          reply = "🤖 Пожалуйста! Обращайтесь ещё!";
        } else if (userMessage.includes('помощь') || userMessage.includes('help')) {
          reply = "🤖 Я могу отвечать на вопросы, помогать с информацией и поддерживать беседу!";
        } else {
          const replies = [
            `Интересный вопрос: "${message}". Я AI-ассистент и постоянно учусь!`,
            `Спасибо за сообщение: "${message}". Стараюсь быть полезным!`,
            `По вопросу "${message}" могу сказать, что это требует изучения.`,
            `Запрос "${message}" получен. Как AI-ассистент, я развиваюсь!`,
            `Отличный вопрос! "${message}" - хорошая тема для обсуждения.`
          ];
          reply = replies[Math.floor(Math.random() * replies.length)];
        }

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 800));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          reply: reply,
          success: true,
          timestamp: new Date().toISOString()
        }));

      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }

  // Serve static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
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
            res.writeHead(200, { 'Content-Type': 'text/html' });
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
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.ico': 'image/x-icon'
    };

    res.writeHead(200, {
      'Content-Type': contentTypes[ext] || 'text/plain'
    });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to view the app`);
});
