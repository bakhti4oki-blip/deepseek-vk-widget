document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');
    const button = form.querySelector('button');

    // Проверяем наличие VK Bridge
    let isVK = false;
    if (typeof vkBridge !== 'undefined') {
        isVK = true;
        try {
            vkBridge.send('VKWebAppInit');
            console.log('VK Mini App initialized');
        } catch (e) {
            console.log('VK Bridge not available');
        }
    }

    // Функция добавления сообщения
    function addMessage(text, isUser = false, source = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user' : 'message bot';
        
        // Добавляем индикатор источника, если есть
        if (source && !isUser) {
            const sourceIndicator = document.createElement('div');
            sourceIndicator.className = 'source-indicator';
            sourceIndicator.textContent = source === 'deepseek-api' ? '🤖 DeepSeek AI' : '💡 Локальный ответ';
            messageDiv.appendChild(sourceIndicator);
        }
        
        const textNode = document.createTextNode(text);
        messageDiv.appendChild(textNode);
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    // Приветственное сообщение
    addMessage('Привет! Я DeepSeek AI ассистент для сообщества о вахтовой работе в Уфе и Башкирии.');

    // Функция отправки сообщения
    async function sendMessage(userMessage) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('Network error:', error);
            
            if (error.message.includes('404')) {
                throw new Error('Сервер временно недоступен');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('Проблемы с интернет-соединением');
            } else {
                throw new Error('Ошибка сервера');
            }
        }
    }

    // Обработчик формы
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userMessage = input.value.trim();
        if (!userMessage) return;

        // Добавляем сообщение пользователя
        addMessage(userMessage, true);
        input.value = '';
        input.disabled = true;
        button.disabled = true;

        // Индикатор загрузки
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = 'Думаю...';
        messages.appendChild(loadingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            const data = await sendMessage(userMessage);
            loadingDiv.remove();
            addMessage(data.reply, false, data.source);

        } catch (error) {
            loadingDiv.remove();
            addMessage('Ошибка: ' + error.message);
        } finally {
            input.disabled = false;
            button.disabled = false;
            setTimeout(() => input.focus(), 100);
        }
    });

    // Фокус на поле ввода
    input.focus();

    // Адаптация для VK
    if (isVK) {
        document.body.classList.add('vk-app');
    }
});
