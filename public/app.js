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
        
        const textContent = document.createElement('div');
        textContent.className = 'message-text';
        textContent.innerHTML = formatMessage(text);
        messageDiv.appendChild(textContent);
        
        // Добавляем индикатор источника только для AI ответов
        if (source && !isUser) {
            const sourceIndicator = document.createElement('div');
            sourceIndicator.className = 'source-indicator';
            if (source === 'deepseek-api') {
                sourceIndicator.innerHTML = '🤖 AI';
            } else {
                sourceIndicator.innerHTML = '💡 База знаний';
            }
            messageDiv.appendChild(sourceIndicator);
        }
        
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    // Функция форматирования сообщения
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/•/g, '•');
    }

    // Приветственное сообщение (одно, без лишней информации)
    setTimeout(() => {
        addMessage('Привет! 👋 Я помощник сообщества «Уфа Работа Вахта Башкирия». У нас есть вакансия изолировщика с обучением с нуля. Чем могу помочь?');
    }, 500);

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
            addMessage('❌ ' + error.message);
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

    // Обработка ссылок ВКонтакте
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.href) {
            if (isVK && typeof vkBridge !== 'undefined') {
                e.preventDefault();
                vkBridge.send('VKWebAppOpenURL', { url: e.target.href });
            }
        }
    });
});
