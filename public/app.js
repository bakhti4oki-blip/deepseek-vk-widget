// VK Mini Apps Integration
document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    // VK Bridge initialization
    let isVK = false;
    
    if (typeof vkBridge !== 'undefined') {
        isVK = true;
        try {
            // Initialize VK Mini App
            await vkBridge.send('VKWebAppInit');
            console.log('VK Mini App initialized');
            
            // Update app height
            await vkBridge.send('VKWebAppSetViewSettings', {
                status_bar_style: 'dark',
                action_bar_color: '#1e40af'
            });
            
        } catch (error) {
            console.error('VK initialization error:', error);
        }
    }

    // Adjust layout for VK
    function adjustForVK() {
        if (isVK) {
            document.body.style.background = '#1e293b';
            const app = document.getElementById('app');
            app.style.width = '100%';
            app.style.height = '100vh';
            app.style.maxWidth = '100%';
            app.style.maxHeight = '100vh';
            app.style.borderRadius = '0';
            app.style.boxShadow = 'none';
        }
    }

    // Function to add message
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user' : 'message bot';
        messageDiv.textContent = text;
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    // Welcome message based on platform
    if (isVK) {
        addMessage('🤖 Привет! Я DeepSeek AI ассистент для вашего сообщества ВКонтакте!');
    } else {
        addMessage('🤖 Привет! Я DeepSeek AI ассистент. Напишите мне сообщение!');
    }

    // Function to send message to server
    async function sendMessage(userMessage) {
        try {
            console.log('Sending message:', userMessage);
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userMessage,
                    platform: isVK ? 'vk' : 'web'
                })
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
                throw new Error('Сервер временно недоступен. Попробуйте позже.');
            } else if (error.message.includes('Failed to fetch')) {
                throw new Error('Проблемы с интернет-соединением.');
            } else {
                throw new Error('Ошибка соединения: ' + error.message);
            }
        }
    }

    // Form submit handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userMessage = input.value.trim();
        if (!userMessage) return;

        // Add user message
        addMessage(userMessage, true);
        input.value = '';
        input.disabled = true;
        form.querySelector('button').disabled = true;

        // Loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot loading';
        loadingDiv.textContent = '⏳ Думаю...';
        loadingDiv.id = 'loading-message';
        messages.appendChild(loadingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            const reply = await sendMessage(userMessage);
            
            // Remove loading indicator
            const loadingElement = document.getElementById('loading-message');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            addMessage(reply);

        } catch (error) {
            console.error('Error:', error);
            
            // Remove loading indicator
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

    // Handle VK events
    if (isVK) {
        // Subscribe to VK events
        vkBridge.subscribe((e) => {
            console.log('VK event:', e.detail);
            
            switch (e.detail.type) {
                case 'VKWebAppUpdateConfig':
                    // Update app appearance
                    const scheme = e.detail.data.scheme || 'client_light';
                    break;
            }
        });

        // Handle app resize
        window.addEventListener('resize', adjustForVK);
    }

    // Initial setup
    adjustForVK();
    input.focus();

    // Prevent zoom on mobile
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});
