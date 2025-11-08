document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    // Проверяем наличие VK Bridge
    let isVK = false;
    if (typeof vkBridge !== 'undefined') {
        isVK = true;
        try {
            vkBridge.send('VKWebAppInit');
        } catch (e) {
            console.log('VK Bridge not available');
        }
    }

    // Функция добавления сообщения
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user' : 'message bot';
        
        // Безопасное создание текстового узла
        const textNode = document.createTextNode(text);
        messageDiv.appendChild(textNode);
        
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    // Приветственное сообщение
    addMessage('Привет! Я DeepSeek AI ассистент для сообщества о вахтовой работе.');

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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return data.reply;

        } catch (error) {
            console.error('Network error:', error);
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Проблемы с соединением');
            } else {
                throw new Error('Ошибка сервера: ' + error.message);
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

        // Индикатор загрузки
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = 'Думаю...';
        loadingDiv.id = loadingId;
        messages.appendChild(loadingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            const reply = await sendMessage(userMessage);
            
            // Убираем индикатор загрузки
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            
            addMessage(reply);

        } catch (error) {
            // Убираем индикатор загрузки
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            
            addMessage('Ошибка: ' + error.message);
        } finally {
            input.disabled = false;
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
