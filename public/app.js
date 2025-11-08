document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    // Инициализация VK Bridge
    let vkBridge;
    if (typeof window !== 'undefined' && window.vkBridge) {
        vkBridge = window.vkBridge;
        vkBridge.send('VKWebAppInit');
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
    addMessage('🤖 Привет! Я DeepSeek AI ассистент. Чем могу помочь?');

    // Функция для отправки сообщения на сервер
    async function sendMessageToServer(userMessage) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userMessage,
                    platform: 'vk' 
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.reply || '🤖 Извините, не удалось обработать запрос';

        } catch (error) {
            console.error('Network error:', error);
            throw new Error('Ошибка соединения с сервером');
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
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = 'DeepSeek думает...';
        loadingDiv.id = 'loading-message';
        messages.appendChild(loadingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            const reply = await sendMessageToServer(userMessage);
            
            // Убираем индикатор загрузки
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            addMessage(reply);

        } catch (error) {
            console.error('Error:', error);
            
            // Убираем индикатор загрузки
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            addMessage('🤖 ' + error.message);
        } finally {
            input.disabled = false;
            input.focus();
        }
    });

    // Адаптация под мобильные устройства VK
    function adjustForMobile() {
        const app = document.getElementById('app');
        if (window.innerWidth <= 768) {
            app.style.maxWidth = '100%';
            app.style.height = '100vh';
            app.style.borderRadius = '0';
        }
    }

    // Инициализация
    window.addEventListener('load', function() {
        adjustForMobile();
        input.focus();
        
        // Для VK Mini Apps - отправляем событие инициализации
        if (vkBridge) {
            vkBridge.send('VKWebAppUpdateConfig', {
                height: document.documentElement.scrollHeight
            });
        }
    });

    window.addEventListener('resize', adjustForMobile);
});
