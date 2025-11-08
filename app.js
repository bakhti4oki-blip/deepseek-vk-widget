const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

function addMessage(text, cls='bot') {
  const el = document.createElement('div');
  el.className = 'message ' + cls;
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  input.value = '';
  const loading = document.createElement('div');
  loading.className = 'message bot';
  loading.textContent = '...';
  messages.appendChild(loading);
  messages.scrollTop = messages.scrollHeight;

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await resp.json();
    if (loading && loading.parentNode) loading.remove();
    if (resp.ok) {
      addMessage(data.reply || 'Пустой ответ от сервера', 'bot');
    } else {
      addMessage('Ошибка: ' + (data.error || resp.statusText), 'bot');
    }
  } catch (err) {
    if (loading && loading.parentNode) loading.remove();
    addMessage('Ошибка сети: ' + err.message, 'bot');
  }
});
