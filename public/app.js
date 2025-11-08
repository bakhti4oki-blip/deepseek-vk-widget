document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    // Функция добавления сообщения
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user' : 'message bot';
        messageDiv.textContent = text;
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    // Приветственное сообщение
    addMessage('🤖 Привет! Я DeepSeek AI ассистент. Чем могу помочь?');

    // Обработчик формы
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userMessage = input.value.trim();
        if (!userMessage) return;

        // Добавляем сообщение пользователя
        addMessage(userMessage, true);
        input.value = '';
        input.disabled = true;

        // Индикатор загрузки
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = 'DeepSeek думает...';
        loadingDiv.id = 'loading-message';
        messages.appendChild(loadingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage })
            });

            // Убираем индикатор загрузки
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.remove();
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.reply) {
                addMessage(data.reply);
            } else {
                addMessage('🤖 Извините, не удалось обработать запрос');
            }

        } catch (error) {
            console.error('Error:', error);
            
            // Убираем индикатор загрузки
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            addMessage('🤖 Ошибка соединения. Попробуйте еще раз.');
        } finally {
            input.disabled = false;
            input.focus();
        }
    });

    // Фокус на поле ввода
    input.focus();
});
