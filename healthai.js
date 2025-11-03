// File: healthai.js

document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');

    let conversationHistory = [];
    let conversationEnded = false;

    // ... (addMessage function remains the same) ...
    function addMessage(sender, text) {
        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${sender}-message`;
        messageBubble.textContent = text;
        chatWindow.appendChild(messageBubble);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function sendMessage() {
        const userText = userInput.value.trim();
        if (!userText || conversationEnded) return;

        addMessage('user', userText);
        userInput.value = '';
        typingIndicator.classList.remove('hidden');

        conversationHistory.push({ role: 'user', parts: [{ text: userText }] });

        try {
            // ✅ CORRECTED: URL now points back to the main server on port 3000
            const response = await fetch('http://localhost:3000/api/health-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: conversationHistory })
            });

            if (!response.ok) {
                // try to read server error details for diagnostics
                const text = await response.text();
                console.error('Health AI API error:', response.status, text);
                throw new Error(text || 'Failed to get a response from the server.');
            }

            const data = await response.json();
            const aiText = data.response;
            
            conversationHistory.push({ role: 'model', parts: [{ text: aiText }] });
            
            if (data.isFinal) {
                conversationEnded = true;
                userInput.disabled = true;
                userInput.placeholder = "Conversation ended. Please consult a doctor.";
                sendBtn.disabled = true;
            }

            addMessage('ai', aiText);

        } catch (error) {
            // Show more diagnostic info when available
            const message = error && error.message ? error.message : 'Sorry, I am having trouble connecting. Please try again later.';
            addMessage('ai', message.includes('Failed to get a response') ? 'Sorry, I am having trouble connecting. Please try again later.' : message);
            console.error('Error:', error);
        } finally {
            typingIndicator.classList.add('hidden');
        }
    }

    async function startConversation() {
        typingIndicator.classList.remove('hidden');
        try {
            // ✅ CORRECTED: URL now points back to the main server on port 3000
            const response = await fetch('http://localhost:3000/api/health-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: [] })
            });
            if (!response.ok) {
                const text = await response.text();
                console.error('Health AI startConversation API error:', response.status, text);
                throw new Error(text || 'Failed to start conversation');
            }
            const data = await response.json();
            const aiText = data.response;
            conversationHistory.push({ role: 'model', parts: [{ text: aiText }] });
            addMessage('ai', aiText);
        } catch (error) {
            addMessage('ai', 'Could not start the conversation. Please refresh the page.');
        } finally {
            typingIndicator.classList.add('hidden');
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    startConversation();
});