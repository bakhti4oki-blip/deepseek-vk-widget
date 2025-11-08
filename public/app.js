document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    // Определяем базовый URL для API
    const getBaseUrl = () => {
        return window.location.origin;
    };

    // Функция добавления сообщения
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user' : 'message bot';
        
        const textNode = document.createTextNode(text);
        messageDiv.appendChild(textNode);
        
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    // Приветственное сообщение
    addMessage('🤖 Привет! Я DeepSeek AI ассистент. Задавайте вопросы, и я постараюсь помочь!');

    // Функция для отправки сообщения на сервер
    async function sendMessageToServer(userMessage) {
        try {
            const response = await fetch(getBaseUrl() + '/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userMessage
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return data.reply || '🤖 Извините, не удалось обработать запрос';

        } catch (error) {
            console.error('Network error:', error);
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Не удалось соединиться с сервером. Проверьте подключение к интернету.');
            } else if (error.message.includes('HTTP 5')) {
                throw new Error('Временные проблемы с сервером. Попробуйте позже.');
            } else {
                throw new Error('Ошибка соединения: ' + error.message);
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
        form.querySelector('button').disabled = true;

        // Индикатор загрузки
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = '⏳ DeepSeek думает...';
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
            
            addMessage('❌ ' + error.message);
        } finally {
            input.disabled = false;
            form.querySelector('button').disabled = false;
            input.focus();
        }
    });

    // Адаптация под разные устройства
    function adjustLayout() {
        const app = document.getElementById('app');
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            app.style.width = '100%';
            app.style.height = '100vh';
            app.style.borderRadius = '0';
        } else {
            app.style.width = '380px';
            app.style.height = '600px';
            app.style.borderRadius = '12px';
        }
    }

    // Инициализация
    window.addEventListener('load', function() {
        adjustLayout();
        input.focus();
    });

    window.addEventListener('resize', adjustLayout);
});
