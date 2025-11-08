import { createServer } from 'http';
import { parse } from 'url';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Импортируем API endpoint
import chatHandler from './API/chat.js';

const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API route
  if (pathname === '/api/chat' && req.method === 'POST') {
    return await chatHandler(req, res);
  }

  // Serve static files
  if (pathname === '/') {
    serveFile(res, join(__dirname, 'public', 'index.html'), 'text/html');
  } else if (pathname === '/app.js') {
    serveFile(res, join(__dirname, 'public', 'app.js'), 'application/javascript');
  } else if (pathname === '/style.css') {
    serveFile(res, join(__dirname, 'public', 'style.css'), 'text/css');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

function serveFile(res, filePath, contentType) {
  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (error) {
    res.writeHead(404);
    res.end('File not found');
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
