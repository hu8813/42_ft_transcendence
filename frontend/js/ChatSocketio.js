let socketio;
let messageInputio;
let recipientSelectio;
const NOTIFICATION_DURATIONio = 2000;
const MAX_RETRIESio = 3;
let retryCountio = 0;

function connectToSocket() {
    const endpoint = 'https://pong.webpubsub.azure.com/client/socketio';
    const accessKey = 'NSlyB/hmHT+bV+mvkaEGcfHPw/dRCcI7d4g9vGepjsM=';
    socketio = io(endpoint, {
        query: {
            'accessKey': accessKey
        }
    });

    console.log('Connecting to Azure Web PubSub for Socket.IO...');

    socketio.on('connect', () => {
        console.log('Connected to Azure Web PubSub for Socket.IO');
        // Your logic after successful connection
    });

    socketio.on('disconnect', () => {
        console.log('Disconnected from Azure Web PubSub for Socket.IO');
        // Your logic after disconnection
    });

    socketio.on('error', (error) => {
        console.error('Socket.IO error:', error);
        // Your error handling logic
    });

    // Add other event listeners as needed
}

function sendMessage(message) {
    socketio.emit('chat message', JSON.stringify(message));
}

function sendMessageFromInput() {
    const inputText = messageInputio.value.trim();
    if (!inputText) return;

    const recipientName = recipientSelectio.value;
    const recipient = recipientName ? recipientName : '#CHANNEL';

    const newMessage = {
        name: localStorage.getItem('userLogin') || 'user42',
        recipient: recipient,
        text: inputText,
    };

    sendMessage(newMessage);
    messageInputio.value = '';

    showNotification("Message sent successfully.", true);
}

function displayMessage(message) {
    const msgerChat = document.getElementById('msger-chat');
    const messageElement = document.createElement('div');
    messageElement.classList.add('msg');

    const isCurrentUser = message.name === (localStorage.getItem('userLogin') || "user42");
    const alignRight = isCurrentUser ? 'right' : 'left';
    messageElement.classList.add(isCurrentUser ? 'right-msg' : 'left-msg');
    messageElement.classList.add('msg-bubble');
    const senderName = message.name || 'Anonymous';
    const formattedCreatedAt = message.created_at ? formatDate(new Date(message.created_at)) : getCurrentTimestamp();

    // Function to decode HTML entities
    function decodeEntities(encodedString) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = encodedString;
        return textarea.value;
    }

    if (message.text.includes("joined the chat")) {
        messageElement.innerHTML = `
            <div class="msg-info" style="text-align: ${alignRight};">
                <span class="msg-info-name" style="color: green;">${decodeEntities(senderName)} has joined the chat</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
        `;
    } else if (message.text.includes("left the chat")) {
        messageElement.innerHTML = `
            <div class="msg-info" style="text-align: ${alignRight};">
                <span class="msg-info-name" style="color: red;">${decodeEntities(senderName)} has left the chat</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
        `;
    } else {
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('msg', isCurrentUser ? 'right-msg' : 'left-msg', 'msg-bubble');
        messageBubble.textContent = decodeEntities(message.text);
        
        const messageInfo = document.createElement('div');
        messageInfo.classList.add('msg-info');
        messageInfo.style.textAlign = alignRight;
        messageInfo.innerHTML = `
            <span class="msg-info-name">${decodeEntities(senderName)}</span>
            <span class="msg-info-time">${formattedCreatedAt}</span>
        `;
        
        messageElement.appendChild(messageInfo);
        messageElement.appendChild(messageBubble);
    }

    // Prepend the message element instead of appending
    msgerChat.prepend(messageElement);
}

function escapeHTML(text) {
    const escapeChars = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, match => escapeChars[match]);
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
}

function getCurrentTimestamp() {
    const currentDate = new Date();
    return formatDate(currentDate);
}

function scrollToBottom() {
    const msgerChat = document.getElementById('msger-chat');
    msgerChat.scrollTop = msgerChat.scrollHeight;
}

function showNotification(message, isSuccess) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.color = isSuccess ? 'green' : 'red';
    setTimeout(() => {
        notification.textContent = '';
    }, NOTIFICATION_DURATIONio);
}

function showChatSocket() {
    messageInputio = document.getElementById('message-input');
    recipientSelectio = document.getElementById('recipient-select');
    const sendButton = document.getElementById('msgSendio');
    const disconnectButton = document.getElementById('msgDisconnect');

    connectToSocket();

    sendButton.addEventListener('click', sendMessageFromInput); // Updated this line
    messageInputio.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessageFromInput();
        }
    });

    disconnectButton.addEventListener('click', () => {
        socketio.disconnect();
    });
};
