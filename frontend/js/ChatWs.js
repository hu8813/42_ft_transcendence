let socket;
let messageInput;
let recipientSelect; 
let NOTIFICATION_DURATION = 2000;
let MAX_RETRIES = 3;
let retryCount = 0;

function getWebSocket() {
    const websocketUrl = 'wss://localhost:8443/ws/chatpage/';

    if (socket && socket.readyState === WebSocket.OPEN) {
        return socket;
    } else {
        socket = new WebSocket(websocketUrl);

        socket.addEventListener('open', () => {
            console.log('WebSocket connection established.');
            const joinMessage = {
                text: 'joined the chat',
                name: localStorage.getItem('userLogin') || "user42"
            };
            sendMessage(joinMessage);
            retryCount = 0;
        });

        socket.addEventListener('message', event => {
            const message = JSON.parse(event.data);
            displayMessage(message);
        });

        socket.addEventListener('error', error => {
            console.error('WebSocket error:', error);
            if (retryCount < MAX_RETRIES) {
                console.log('Retrying WebSocket connection...');
                retryCount++;
                setTimeout(getWebSocket, 3000); 
            } else {
                console.error('Maximum retry attempts reached. Unable to establish WebSocket connection.');
            }
        });

        return socket;
    }
}

function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error('WebSocket connection is not open.');
    }
}

function sendMessageFromInput() {
    const inputText = messageInput.value.trim();
    if (!inputText) return;

    const recipientName = recipientSelect.value;
    const recipient = recipientName ? recipientName : '#CHANNEL';

    const newMessage = {
        name: localStorage.getItem('userLogin') || "user42",
        recipient: recipient,
        text: inputText,
    };


    sendMessage(newMessage);
    messageInput.value = '';

    showNotification("Message sent successfully.", true);
}

function displayMessage(message) {
    const msgerChat = document.getElementById('msger-chat');
    const messageElement = document.createElement('div');
    messageElement.classList.add('msg');

    const isCurrentUser = message.name === (localStorage.getItem('userLogin') || "user42");
    const alignRight = isCurrentUser ? 'right' : 'left';

    const senderName = message.name || 'Anonymous';
    const formattedCreatedAt = message.created_at ? formatDate(new Date(message.created_at)) : getCurrentTimestamp();


    if (message.text.includes("joined the chat")) {
        messageElement.innerHTML = `
            <div class="msg-info" style="text-align: ${alignRight};">
                <span class="msg-info-name" style="color: green;">${senderName} has joined the chat</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
            
        `;
    } else if (message.text.includes("left the chat")) {
        messageElement.innerHTML = `
            <div class="msg-info" style="text-align: ${alignRight};">
                <span class="msg-info-name" style="color: red;">${senderName} has left the chat</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
            
        `;
    } else {
        messageElement.innerHTML = `
            <div class="msg-info" style="text-align: ${alignRight};">
                <span class="msg-info-name">${senderName}</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
            <div class="msg ${isCurrentUser ? 'right-msg' : 'left-msg'} msg-bubble ">${message.text}</div>
        `;
    }

    // Prepend the message element instead of appending
    msgerChat.prepend(messageElement);
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
    }, NOTIFICATION_DURATION);
}

function showChatPageWS() {
    messageInput = document.getElementById('message-input');
    recipientSelect = document.getElementById('recipient-select');
    const sendBtn = document.getElementById('msgSend');
    const disconnectBtn = document.getElementById('msgDisconnect'); // Add this line

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessageFromInput);
    }

    if (disconnectBtn) { 
        disconnectBtn.addEventListener('click', function() {
            if (socket) {
                socket.close();
                console.log('WebSocket disconnected.');
            } else {
                console.log('WebSocket is not initialized.');
            }
        });
    }

    messageInput.addEventListener('keypress', function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessageFromInput();
        }
    });

    messageInput.addEventListener('keydown', function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessageFromInput();
        }
    });

    socket = getWebSocket();
}
