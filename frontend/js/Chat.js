let socket;
let messageInput;
let recipientSelect; 
let NOTIFICATION_DURATION = 2000;
let MAX_RETRIES = 3;
let retryCount = 0;
let isDisconnected = false;
let lastMessageSentTime = 0;
const MESSAGE_SEND_INTERVAL = 5000; // 5 seconds (adjust as needed)
const MAX_MESSAGE_LENGTH = 200; // Maximum character limit for a message

function toggleSocketConnection() {
    if (isDisconnected) {
        // Reconnect the socket
        socket = getWebSocket();
        document.getElementById('msgDisconnect').textContent = 'Disconnect';
    } else {
        // Disconnect the socket
        if (socket) {
            console.log('WebSocket disconnected.');
            const leftMessage = {
                text: 'left the chat',
                name: localStorage.getItem('userLogin') || "user42"
            };
            sendMessage(leftMessage);
        
            // Wait for 1 second (adjust as needed)
            setTimeout(function() {
                socket.close();
                document.getElementById('msgDisconnect').textContent = 'Reconnect';
            }, 2000); // 1000 milliseconds = 1 second
        } else {
            console.log('WebSocket is not initialized.');
        }
    }
    isDisconnected = !isDisconnected; // Toggle the disconnected status
}

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
        showNotification("Message sent successfully.", true);
    } else {
        console.error('WebSocket connection is not open.');
        showNotification("You are disconnected. Trying to reconnect...", false);
        toggleSocketConnection(); // Initiates reconnection

        // Check for WebSocket connection reestablishment after a delay
        setTimeout(() => {
            if (socket.readyState === WebSocket.OPEN) {
                showNotification("Reconnected. Message sent successfully.", true);
                const joinMessage3 = {
                    text: 'joined the chat',
                    name: localStorage.getItem('userLogin') || "user42"
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
    if (msgerChat)
        msgerChat.prepend(messageElement);
}


function openChat() {
    messageInput = document.getElementById('message-input');
    recipientSelect = document.getElementById('recipient-select');
    const sendBtn = document.getElementById('msgSend');
    const msgDisconnect = document.getElementById('msgDisconnect'); // Add this line

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
}

function sendMessageFromInput() {
    const inputText = messageInput.value.trim();
    if (!inputText) return;

    // Check if the message length exceeds the maximum allowed
    if (inputText.length > MAX_MESSAGE_LENGTH) {
        showNotification(`Message exceeds the maximum character limit ${MAX_MESSAGE_LENGTH}.`, false);
        return;
    }

    const currentTime = new Date().getTime();

    // Check if the elapsed time since the last message sent is less than the interval
    if (currentTime - lastMessageSentTime < MESSAGE_SEND_INTERVAL) {
        showNotification("Please wait before sending another message.", false);
        return;
    }

    // Update the last message sent time
    lastMessageSentTime = currentTime;

    const recipientName = recipientSelect.value;
    const recipient = recipientName ? recipientName : '#CHANNEL';

    const newMessage = {
        name: localStorage.getItem('userLogin') || "user42",
        recipient: recipient,
        text: inputText,
    };

    sendMessage(newMessage);

    showNotification("Message sent successfully.", true);
    // Disable the send button temporarily to prevent rapid clicking
    const sendBtn = document.getElementById('msgSend');

    if (sendBtn){
        sendBtn.disabled = true;
        setTimeout(() => {
            sendBtn.disabled = false;
        }, MESSAGE_SEND_INTERVAL);
    }
}




// Function to escape HTML special characters
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
    }, NOTIFICATION_DURATION);
}
