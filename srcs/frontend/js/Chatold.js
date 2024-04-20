let fetchMessagesInterval;


function fetchMessages() {
    const path = window.location.hash || '#'; 

    
    apiUrl = `/api/messages`;
    
    if (path === '#chat' && apiUrl) {
        fetch(apiUrl)
            .then(response => response.json())
            .then(messages => {
                localStorage.setItem('cachedMessages', JSON.stringify(messages)); 
            })
            .catch(error => console.error('Error fetching messages:', error));
    }
}



function fetchUsersAndTranslations(recipientSelect) {
    return Promise.all([
        translateKey('selectRecipient'),
        translateKey('channel'),
        fetch(`/api/get_all_users`).then(response => response.json())
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
    const apiUrl = `/api/messages`;
    const onlineUsersElement = document.getElementById('recipient-select');
    const msgerChat = document.getElementById('msger-chat'); 
    const messageInput = document.getElementById('message-input');
    let sendBtn = document.getElementById('msgSend');
    const recipientSelect = document.getElementById('recipient-select');
    const recipientActions = document.getElementById('recipient-actions');
    const notification = document.getElementById('notification'); 
    const NOTIFICATION_DURATION = 2000;

    window.addEventListener('unload', () => {
        clearInterval(fetchMessagesInterval);
    });

    translateKey('msgPlaceholder').then(msgPlaceholderTranslation => {
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

    
    fetchMessagesInterval = setInterval(fetchMessages, 3000);

    window.addEventListener('unload', () => {
        clearInterval(fetchMessagesInterval);
        console.log("clear interval2");
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
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        })
        .then(response => response.json())
        .then(data => {
            addMessage(data);
        })
        .catch(error => console.error('Error sending message:', error));
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

    function fetchMessages() {
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
}
