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
    addMessage('🤖 Привет! Я DeepSeek AI ассистент. Задавайте вопросы, и я постараюсь помочь!');

    // Функция для отправки сообщения на сервер
    async function sendMessageToServer(userMessage) {
        try {
            console.log('Отправка сообщения на сервер:', userMessage);
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userMessage
                })
            });

            console.log('Статус ответа:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Данные ответа:', data);
            
            return data.reply || '🤖 Извините, не удалось обработать запрос';

        } catch (error) {
            console.error('Ошибка сети:', error);
            
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Не удалось соединиться с сервером. Проверьте подключение к интернету.');
            } else if (error.message.includes('HTTP 404')) {
                throw new Error('Сервер временно недоступен. Пожалуйста, попробуйте позже.');
            } else if (error.message.includes('HTTP 5')) {
                throw new Error('Временные проблемы с сервером. Попробуйте через минуту.');
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
            console.error('Ошибка:', error);
            
            // Убираем индикатор загрузки
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            addMessage('❌ ' + error.message);
        } finally {
            input.disabled = false;
            input.focus();
        }
    });

    // Фокус на поле ввода при загрузке
    input.focus();
});
