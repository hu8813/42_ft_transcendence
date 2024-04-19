let socket;
let messageInput;
let recipientSelect;
let onlineUsersList; // Variable to store online users list
let NOTIFICATION_DURATION = 2000;
let MAX_RETRIES = 3;
let retryCount = 0;
let isDisconnected = false;
let lastMessageSentTime = 0;
const MESSAGE_SEND_INTERVAL = 5000;
const MAX_MESSAGE_LENGTH = 200;
let storedMessages;
let msgerChat;

// Function to toggle WebSocket connection
function toggleSocketConnection() {
    if (isDisconnected) {
        socket = getWebSocket();
        document.getElementById('msgDisconnect').textContent = 'Disconnect';
    } else {
        if (socket) {
            console.log('WebSocket disconnected.');
            const leftMessage = {
                text: 'left the chat',
                name: localStorage.getItem('userNickname') || localStorage.getItem('userLogin') || "user42"
            };
            sendMessage(leftMessage);
            setTimeout(function () {
                socket.close();
                document.getElementById('msgDisconnect').textContent = 'Reconnect';
            }, 2000);
        } else {
            console.log('WebSocket is not initialized.');
        }
    }
    isDisconnected = !isDisconnected;
}

// Function to get WebSocket instance
function getWebSocket() {
    let websocketUrl;
    if (window.location.href.includes("pong42") || window.location.hostname.includes("vercel"))
        websocketUrl = 'wss://free.blr2.piesocket.com/v3/1?api_key=buvwKcn05V6m1mGJRk0dDJ9FklYFMkFBtM4OMgnv&notify_self=1';
    else
        websocketUrl = 'wss://localhost:8443/ws/chatpage/';
    if (socket && socket.readyState === WebSocket.OPEN) {
        return socket;
    } else {
        socket = new WebSocket(websocketUrl);

        socket.addEventListener('open', () => {
            console.log('WebSocket connection established.');
            const joinMessage = {
                text: 'joined the chat',
                name: localStorage.getItem('userNickname') || localStorage.getItem('userLogin') || "user42"
            };
            sendMessage(joinMessage);
            retryCount = 0;
        });

        socket.addEventListener('message', event => {
            const message = JSON.parse(event.data);
            if (message.type === 'onlineUsers') {
                updateOnlineUsers(message.users);
            } else {
                displayMessage(message);
            }
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

// Function to send a message
function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        showNotification("Message sent successfully.", true);
    } else {
        console.error('WebSocket connection is not open.');
        showNotification("You are disconnected. Trying to reconnect...", false);
        toggleSocketConnection();
        setTimeout(() => {
            if (socket.readyState === WebSocket.OPEN) {
                showNotification("Reconnected. Message sent successfully.", true);
                const joinMessage3 = {
                    text: 'joined the chat',
                    name: localStorage.getItem('userNickname') || localStorage.getItem('userLogin') || "user42"
                };
                socket.send(JSON.stringify(joinMessage3));
                socket.send(JSON.stringify(message));
            } else {
                console.error('WebSocket connection could not be reestablished.');
                showNotification("Failed to reconnect. Please try again later.", false);
            }
        }, 2000);
    }
}

// Function to save a message locally
function saveMessageToLocal(message) {
    const storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    const isMessageExists = storedMessages.some(msg => {
        return msg.text === message.text && msg.name === message.name && msg.recipient === message.recipient;
    });
    if (!isMessageExists) {
        storedMessages.push(message);
        localStorage.setItem('chatMessages', JSON.stringify(storedMessages));
    }
}

// Function to display a message
function displayMessage(message) {
    msgerChat = document.getElementById('msger-chat');
    const messageElement = document.createElement('div');
    messageElement.classList.add('msg');

    const isCurrentUser = message.name === (localStorage.getItem('userNickname') || localStorage.getItem('userLogin') || "user42");
    const alignRight = isCurrentUser ? 'right' : 'left';
    messageElement.classList.add(isCurrentUser ? 'right-msg' : 'left-msg');
    messageElement.classList.add('msg-bubble');
    const senderName = message.name || 'Anonymous';
    const formattedCreatedAt = message.created_at ? formatDate(new Date(message.created_at)) : getCurrentTimestamp();

    if (messageElement && message && message.text.includes("joined the chat")) {
        messageElement.innerHTML = `
            <div class="msg-info" style="text-align: ${alignRight};">
                <span class="msg-info-name" style="color: green;">${escapeHTML(senderName)} has joined the chat</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
        `;
    } else if (messageElement && message.text.includes("left the chat")) {
        messageElement.innerHTML = `
            <div class="msg-info" style="text-align: ${alignRight};">
                <span class="msg-info-name" style="color: red;">${escapeHTML(senderName)} has left the chat</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
        `;
    } else {
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('msg', isCurrentUser ? 'right-msg' : 'left-msg', 'msg-bubble');
        messageBubble.textContent = escapeHTML(message.text);

        const messageInfo = document.createElement('div');
        messageInfo.classList.add('msg-info');
        messageInfo.style.textAlign = alignRight;
        messageInfo.innerHTML = `
            <span class="msg-info-name">${escapeHTML(senderName)}</span>
            <span class="msg-info-time">${formattedCreatedAt}</span>
        `;

        messageElement.appendChild(messageInfo);
        messageElement.appendChild(messageBubble);
    }

    if (msgerChat)
        msgerChat.prepend(messageElement);

    saveMessageToLocal(message);
}

// Function to open the chat
function openChat() {
    messageInput = document.getElementById('message-input');
    recipientSelect = document.getElementById('recipient-select');
    onlineUsersList = document.getElementById('online-users-list'); // Reference to online users list
    const sendBtn = document.getElementById('msgSend');
    const msgDisconnect = document.getElementById('msgDisconnect');
    msgerChat = document.getElementById('msger-chat');

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessageFromInput);
    }

    if (msgDisconnect) {
        msgDisconnect.addEventListener('click', toggleSocketConnection);
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
    if (msgerChat.childElementCount === 0) {
        storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        storedMessages.forEach(message => displayMessage(message));
    }

    if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'requestOnlineUsers' }));
    }
}

// Function to send a message from input
function sendMessageFromInput() {
    const inputText = messageInput.value.trim();
    if (!inputText) return;

    if (inputText.length > MAX_MESSAGE_LENGTH) {
        showNotification(`Message exceeds the maximum character limit ${MAX_MESSAGE_LENGTH}.`, false);
        return;
    }

    const currentTime = new Date().getTime();

    if (currentTime - lastMessageSentTime < MESSAGE_SEND_INTERVAL) {
        showNotification("Please wait before sending another message.", false);
        return;
    }

    lastMessageSentTime = currentTime;

    const recipientName = recipientSelect.value;
    const recipient = recipientName ? recipientName : '#CHANNEL';

    const newMessage = {
        name: localStorage.getItem('userNickname') || localStorage.getItem('userLogin') || "user42",
        recipient: recipient,
        text: inputText,
    };

    sendMessage(newMessage);
    if (messageInput)
        messageInput.value = '';
    showNotification("Message sent successfully.", true);

    const sendBtn = document.getElementById('msgSend');

    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.style.visibility = false;
        setTimeout(() => {
            sendBtn.disabled = false;
        }, MESSAGE_SEND_INTERVAL);
    }
}

// Function to update the list of online users
function updateOnlineUsers(users) {
    onlineUsersList.innerHTML = ''; // Clear the existing list
    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = user;
        listItem.classList.add('online-user');
        listItem.addEventListener('click', () => {
            // Send a message to the selected user
            recipientSelect.value = user;
        });
        onlineUsersList.appendChild(listItem);
    });
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
        if (notification)
            notification.textContent = '';
    }, NOTIFICATION_DURATION);
}
