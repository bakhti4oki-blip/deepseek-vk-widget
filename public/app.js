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
            vkBridge.send('VKWebAppInit').then(() => {
                console.log('VK Mini App initialized');
            }).catch(err => {
                console.log('VK Bridge not available');
            });
        } catch (e) {
            console.log('VK Bridge error:', e);
        }
    }

    // Функция добавления сообщения
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user' : 'message bot';
        messageDiv.textContent = text;
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    // Приветственное сообщение
    addMessage('Привет! Я DeepSeek AI ассистент для сообщества о вахтовой работе в Уфе и Башкирии.');

    // Функция отправки сообщения
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
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return data.reply;

        } catch (error) {
            console.error('Network error:', error);
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Проблемы с интернет-соединением');
            } else if (error.message.includes('HTTP 5')) {
                throw new Error('Временная ошибка сервера');
            } else {
                throw new Error('Ошибка: ' + error.message);
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
            const reply = await sendMessage(userMessage);
            
            // Убираем индикатор загрузки
            loadingDiv.remove();
            addMessage(reply);

        } catch (error) {
            // Убираем индикатор загрузки
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
        // Обновляем высоту для VK
        if (typeof vkBridge !== 'undefined') {
            setTimeout(() => {
                vkBridge.send('VKWebAppSetViewSettings', {
                    status_bar_style: 'light',
                    action_bar_color: '#000000'
                });
            }, 1000);
        }
    }
});
