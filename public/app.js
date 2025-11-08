const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

function addMessage(text, cls = 'bot') {
  const el = document.createElement('div');
  el.className = 'message ' + cls;
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

// Добавляем приветственное сообщение
addMessage('🤖 Привет! Я DeepSeek AI ассистент. Чем могу помочь?', 'bot');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  // Добавляем сообщение пользователя
  addMessage(text, 'user');
  input.value = '';

  // Показываем индикатор загрузки
  const loading = document.createElement('div');
  loading.className = 'message bot loading';
  loading.textContent = 'DeepSeek думает...';
  messages.appendChild(loading);
  messages.scrollTop = messages.scrollHeight;

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    // Убираем индикатор загрузки
    loading.remove();

    if (resp.ok) {
      const data = await resp.json();
      addMessage(data.reply, 'bot');
    } else {
      const errorData = await resp.json();
      addMessage(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`, 'bot');
    }
  } catch (err) {
    loading.remove();
    addMessage('Ошибка сети: ' + err.message, 'bot');
  }
});

// Фокус на input при загрузке
window.addEventListener('load', () => {
  input.focus();
});
