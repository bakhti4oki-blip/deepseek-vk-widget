document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user' : 'message bot';
        messageDiv.textContent = text;
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    // Welcome message
    addMessage('🤖 Привет! Я DeepSeek AI ассистент. Напишите мне сообщение!');

    async function sendMessage(userMessage) {
        try {
            console.log('Sending message:', userMessage);
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.reply;

        } catch (error) {
            console.error('Network error:', error);
            
            if (error.message.includes('404')) {
                throw new Error('Сервер временно недоступен. Попробуйте обновить страницу.');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('Проблемы с интернет-соединением.');
            } else {
                throw new Error('Ошибка: ' + error.message);
            }
        }
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userMessage = input.value.trim();
        if (!userMessage) return;

        // Add user message
        addMessage(userMessage, true);
        input.value = '';
        input.disabled = true;

        // Loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = '⏳ Думаю...';
        loadingDiv.id = 'loading-message';
        messages.appendChild(loadingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            const reply = await sendMessage(userMessage);
            document.getElementById('loading-message').remove();
            addMessage(reply);

        } catch (error) {
            document.getElementById('loading-message').remove();
            addMessage('❌ ' + error.message);
        } finally {
            input.disabled = false;
            input.focus();
        }
    });

    // Focus input
    input.focus();
});
