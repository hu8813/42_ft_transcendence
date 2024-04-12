let fetchMessagesInterval;
let socket;

function getWebSocket() {
    const websocketUrl = getBackendURL().includes('localhost') ?
        'wss://localhost:8443/ws/chatpage/' :
        'wss://your-production-backend-url/ws/chatpage/';

    if (socket && socket.readyState === WebSocket.OPEN) {
        return socket;
    } else {
        socket = new WebSocket(websocketUrl);

        socket.addEventListener('open', () => {
            console.log('WebSocket connection established.');
        });

        socket.addEventListener('message', event => {
            const messages = JSON.parse(event.data);
            localStorage.setItem('cachedMessages', JSON.stringify(messages));
        });

        socket.addEventListener('error', error => {
            console.error('WebSocket error:', error);
        });

        return socket;
    }
}

function fetchMessagesWebSocket() {
    const socket = getWebSocket();

    // Check if the socket is open
    if (socket.readyState === WebSocket.OPEN) {
        // Send a message to the WebSocket server to fetch messages
        const message = {
            type: 'fetch_messages'
        };
        socket.send(JSON.stringify(message));
    } else {
        console.error('WebSocket connection is not open.');
    }
}

function fetchMessagesFetchAPI() {
    const path = window.location.hash || '#'; 

    apiUrl = `${getBackendURL()}/messages`;
    
    if (path === '#chat' && apiUrl) {
        fetch(apiUrl)
            .then(response => response.json())
            .then(messages => {
                localStorage.setItem('cachedMessages', JSON.stringify(messages)); 
            })
            .catch(error => console.error('Error fetching messages:', error));
    }
}

function fetchMessages2() {
    const path = window.location.hash || '#'; 

    if (path === '#chat') {
        fetch(apiUrl)
            .then(response => response.json())
            .then(messages => {
                msgerChat.innerHTML = '';
                messages.forEach(message => {

                    if (message.recipient === PERSON_NAME || message.recipient === '' || message.recipient === '#CHANNEL') {
                        const createdAt = message.created_at ? new Date(message.created_at) : null; 
                        const formattedCreatedAt = createdAt ? formatDate(createdAt) : '';
                        const formattedMessage = { ...message, created_at: formattedCreatedAt };
                        addMessage(formattedMessage);
                    }
                });
            })
            .catch(error => console.error('Error fetching messages:', error));
    }
}

function fetchMessages() {
    if (getBackendURL().includes('localhost')) {
        fetchMessagesWebSocket();
    } else {
        fetchMessages2();
    }
}

function fetchUsersAndTranslations(recipientSelect) {
    return Promise.all([
        translateKey('chat.selectRecipient'),
        translateKey('chat.channel'),
        fetch(`${getBackendURL()}/get_all_users`).then(response => response.json())
    ]);
}

function displayUsers(selectRecipient, users, selectRecipientTranslation, channelTranslation) {
    selectRecipient.innerHTML = '';

    const defaultOptions = [
        { value: "", id:"selectRecipient", text: selectRecipientTranslation },
        { value: "", text: "--------" },
        { value: "", id:"channel", text: channelTranslation },
        { value: "", text: "--------" }
    ];
    defaultOptions.forEach(option => {
        const defaultOption = document.createElement('option');
        defaultOption.value = option.value;
        defaultOption.textContent = option.text;
        selectRecipient.appendChild(defaultOption);
    });

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user;
        option.textContent = user;
        selectRecipient.appendChild(option);
    });
}

function fetchAndDisplayUsers(recipientSelect) {
    if (recipientSelect) {
        fetchUsersAndTranslations(recipientSelect)
        .then(([selectRecipientTranslation, channelTranslation, users]) => {
            displayUsers(recipientSelect, users, selectRecipientTranslation, channelTranslation);
        })
        .catch(error => console.error('Error fetching translations or users:', error));
        translate(currentLanguage);
    }
}

function openChat() {
    let PERSON_NAME = localStorage.getItem('userLogin') || "user42";
    const apiUrl = `${getBackendURL()}/messages`;
    const onlineUsersElement = document.getElementById('recipient-select');
    const msgerChat = document.getElementById('msger-chat'); 
    const messageInput = document.getElementById('message-input');
    let sendBtn = document.getElementById('msgSend');
    const recipientSelect = document.getElementById('recipient-select');
    const recipientActions = document.getElementById('recipient-actions');
    const notification = document.getElementById('notification'); 
    const NOTIFICATION_DURATION = 2000;

    function displayCachedMessages() {
        // Retrieve cached messages from localStorage
        const cachedMessagesString = localStorage.getItem('cachedMessages');
    
        if (cachedMessagesString) {
            // Parse cached messages string to JSON
            const cachedMessages = JSON.parse(cachedMessagesString);
    
            // Check if cachedMessages is an array
            if (Array.isArray(cachedMessages)) {
                // Clear existing messages
                msgerChat.innerHTML = '';
    
                // Iterate over cached messages and display them
                cachedMessages.forEach(message => {
                    // Check if the recipient matches the current user or if it's empty
                    if (message.recipient === PERSON_NAME || message.recipient === '' || message.recipient.startsWith('#')) {
                        const createdAt = message.created_at ? new Date(message.created_at * 1000) : null;
                        const formattedCreatedAt = createdAt ? formatDate(createdAt) : '';
                        const formattedMessage = { ...message, created_at: formattedCreatedAt };
                        addMessage(formattedMessage);
                    }
                });
            } else {
                console.error('Cached messages retrieved from localStorage is not an array:', cachedMessages);
            }
        } else {
            console.log('No cached messages found in localStorage.');
        }
    }

    window.addEventListener('unload', () => {
        clearInterval(fetchMessagesInterval);
    });

    translateKey('chat.msgPlaceholder').then(msgPlaceholderTranslation => {
        messageInput.placeholder = msgPlaceholderTranslation;
    });

    function showNotification(message, isSuccess) {
        notification.textContent = message;
        notification.style.color = isSuccess ? 'green' : 'red';
        setTimeout(() => {
            notification.textContent = '';
        }, NOTIFICATION_DURATION);
    }

    fetchAndDisplayUsers(recipientSelect);

    fetchMessages(); 

    displayCachedMessages(); 

    fetchMessagesInterval = setInterval(fetchMessages, 3000);

    window.addEventListener('unload', () => {
        clearInterval(fetchMessagesInterval);
        console.log("Interval cleared.");
    });

    recipientSelect.addEventListener('change', () => {
        const selectedUser = recipientSelect.value;
        recipientActions.innerHTML = ''; 

        if (selectedUser) {
            const inviteButton = document.createElement('button');
            inviteButton.textContent = 'Invite to Play';
            inviteButton.addEventListener('click', () => {
                console.log(`Inviting ${selectedUser} to play.`);
            });

            const profileButton = document.createElement('button');
            profileButton.textContent = 'Show Profile';
            profileButton.addEventListener('click', () => {
                window.open(`#viewprofile?u=${selectedUser}`, '_blank');
            });
            profileButton.classList.add('msger-msgSend'); 

            const blockButton = document.createElement('button');
            blockButton.textContent = 'Block private messages';
            blockButton.addEventListener('click', () => {
                console.log(`Blocking private messages from ${selectedUser}.`);
            });

            recipientActions.appendChild(inviteButton);
            recipientActions.appendChild(profileButton);
            recipientActions.appendChild(blockButton);
        }
    });

    function formatDate(dateString) {
        const date = new Date(dateString); 
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month} ${hours}:${minutes}`;
    }

    function scrollToBottom() {
        //msgerChat.scrollTop = msgerChat.scrollHeight;
    }

    function addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('msg');
    
        const isCurrentUser = message.name === PERSON_NAME;
    
        if (isCurrentUser) {
            messageElement.classList.add('right-msg');
        } else {
            messageElement.classList.add('left-msg');
        }
    
        const alignRight = isCurrentUser ? 'right' : 'left';
    
        const senderName = message.name || 'Anonymous';
        const formattedCreatedAt = message.created_at;
        messageElement.innerHTML = `
            <div class="msg-info" style="text-align: ${alignRight};">
                <span class="msg-info-name">${senderName}</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
            <div class="msg-bubble" style="text-align: ${alignRight};">${message.text}</div>
        `;
        
        msgerChat.insertBefore(messageElement, msgerChat.firstChild);
    
        scrollToBottom();
    }
    
    function sendMessage(message) {
        messageInput.value = '';
    
        if (window.WebSocket) {
            const socket = getWebSocket();
    
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(message));
            } else {
                console.error('WebSocket connection is not open.');
                fallbackToFetch(message);
            }
        } else {
            fallbackToFetch(message);
        }
    }
    
    
    function fallbackToFetch(message) {
        const apiUrl = `${getBackendURL()}/messages`;
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Message sent via fetch:', data);
            addMessage(data); 
        })
        .catch(error => console.error('Error sending message via fetch:', error));
    }

    if (!sendBtn)
        sendBtn = document.getElementById('msgSend');
    if (sendBtn){
        sendBtn.addEventListener('click', function () {
            sendMessageFromInput();
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
    
    let lastMessageSentTime = 0;
    const MESSAGE_SEND_INTERVAL = 5000; 
    const MAX_MESSAGE_LENGTH = 200; 

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

        const recipientName = recipientSelect.value;
        const recipient = recipientName ? recipientName : '#CHANNEL';

        const newMessage = {
            name: PERSON_NAME,
            recipient: recipient,
            text: inputText,
        };

        sendMessage(newMessage);
        lastMessageSentTime = currentTime;

        sendBtn.disabled = true;
        sendBtn.style.visibility = 'hidden';
        setTimeout(() => {
            sendBtn.disabled = false;
            sendBtn.style.visibility = 'visible'; 
        }, MESSAGE_SEND_INTERVAL);

        showNotification("Message sent successfully.", true);
    }

    fetchMessagesInterval = setInterval(fetchMessages, 3000);

    window.addEventListener('unload', () => {
        clearInterval(fetchMessagesInterval);
        console.log("Interval cleared.");
    });

    recipientSelect.addEventListener('change', () => {
        const selectedUser = recipientSelect.value;
        recipientActions.innerHTML = ''; 

        if (selectedUser) {
            const inviteButton = document.createElement('button');
            inviteButton.textContent = 'Invite to Play';
            inviteButton.addEventListener('click', () => {
                console.log(`Inviting ${selectedUser} to play.`);
            });

            const profileButton = document.createElement('button');
            profileButton.textContent = 'Show Profile';
            profileButton.addEventListener('click', () => {
                window.open(`#viewprofile?u=${selectedUser}`, '_blank');
            });
            profileButton.classList.add('msger-msgSend'); 

            const blockButton = document.createElement('button');
            blockButton.textContent = 'Block private messages';
            blockButton.addEventListener('click', () => {
                console.log(`Blocking private messages from ${selectedUser}.`);
            });

            recipientActions.appendChild(inviteButton);
            recipientActions.appendChild(profileButton);
            recipientActions.appendChild(blockButton);
        }
    });
    fetchMessages();
}
