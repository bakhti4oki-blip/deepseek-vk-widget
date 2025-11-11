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
        textContent.innerHTML = formatMessage(text); // Используем innerHTML для форматирования
        messageDiv.appendChild(textContent);
        
        // Добавляем индикатор источника только для AI ответов
        if (source && !isUser) {
            const sourceIndicator = document.createElement('div');
            sourceIndicator.className = 'source-indicator';
            if (source === 'deepseek-api') {
                sourceIndicator.innerHTML = '🤖 <strong>DeepSeek AI</strong>';
            } else {
                sourceIndicator.innerHTML = '💡 <strong>Локальная база знаний</strong>';
            }
            messageDiv.appendChild(sourceIndicator);
        }
        
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    // Функция форматирования сообщения (жирный текст, эмодзи)
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **текст** в жирный
            .replace(/\n/g, '<br>') // Переносы строк
            .replace(/•/g, '•'); // Сохраняем буллеты
    }

    // Приветственное сообщение
    setTimeout(() => {
        addMessage('👋 Привет! Рад вас видеть!\n\nЯ помощник сообщества «Уфа Работа Вахта Башкирия».');
        
        setTimeout(() => {
            addMessage('У нас есть интересная вакансия — **изолировщик промышленного трубопровода**. Это работа с обучением с нуля!\n\nЧто бы вы хотели узнать? Например:\n• 🏢 Условия работы и зарплата\n• 📅 График вахты  \n• 📋 Требования к кандидатам\n• 🎓 Обучение с нуля\n• 📄 Документы для трудоустройства\n\nВыбирайте — расскажу подробнее! 😊');
        }, 800);
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

    // Быстрые кнопки для частых вопросов
    function addQuickButtons() {
        const quickButtons = [
            'Условия работы',
            'Зарплата',
            'График вахты',
            'Обучение с нуля',
            'Контакты'
        ];

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'quick-buttons';
        
        quickButtons.forEach(text => {
            const button = document.createElement('button');
            button.className = 'quick-button';
            button.textContent = text;
            button.addEventListener('click', () => {
                input.value = text;
                form.dispatchEvent(new Event('submit'));
            });
            buttonsContainer.appendChild(button);
        });

        messages.appendChild(buttonsContainer);
    }

    // Добавляем быстрые кнопки после загрузки
    setTimeout(addQuickButtons, 2000);

    // Фокус на поле ввода
    input.focus();

    // Адаптация для VK
    if (isVK) {
        document.body.classList.add('vk-app');
    }
});
