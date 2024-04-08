let fetchMessagesInterval;

function openChat() {
    let PERSON_NAME = localStorage.getItem('userLogin') || "user42";
    const apiUrl = `${getBackendURL()}/api/messages`;
    const onlineUsersElement = document.getElementById('recipient-select');
    const msgerChat = document.getElementById('msger-chat');
    const messageInput = document.getElementById('message-input');
    let sendBtn = document.getElementById('msgSend');
    const recipientSelect = document.getElementById('recipient-select');
    const recipientActions = document.getElementById('recipient-actions');
    const notification = document.getElementById('notification'); // Notification area
    const NOTIFICATION_DURATION = 2000;

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
     
    function fetchAllUsers() {
        // Fetch translations for placeholder and channel label
        Promise.all([
            translateKey('chat.selectRecipient'),
            translateKey('chat.channel')
        ])
        .then(([selectRecipientTranslation, channelTranslation]) => {
            fetch(`${getBackendURL()}/api/get_all_users`)
            .then(response => response.json())
            .then(users => {
                // Clear existing options
                recipientSelect.innerHTML = '';
                // Add default options
                const defaultOptions = [
                    { value: "", id:"selectRecipient",text: selectRecipientTranslation },
                    { value: "", text: "--------" },
                    { value: "", id:"channel", text: channelTranslation },
                    { value: "", text: "--------" }
                ];
                defaultOptions.forEach(option => {
                    const defaultOption = document.createElement('option');
                    defaultOption.value = option.value;
                    defaultOption.textContent = option.text;
                    recipientSelect.appendChild(defaultOption);
                });
                // Populate options with all users
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user;
                    option.textContent = user;
                    recipientSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching users:', error));
        })
        .catch(error => console.error('Error fetching translations:', error));
        translate(currentLanguage);
    }
    

    if (recipientSelect) {
        fetchAllUsers(); // Modify recipientSelect's innerHTML only if it exists
    }

    function formatDate(date) {
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
    
        // Check if the message sender is the current user
        const isCurrentUser = message.name === PERSON_NAME;
    
        if (isCurrentUser) {
            messageElement.classList.add('right-msg');
        } else {
            messageElement.classList.add('left-msg');
        }
    
        // Align the sender's name and message to the right if it's sent by the current user
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
        
        // Prepend the new message element to the top of the chat container
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
            console.log("Send button clicked");
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
    const MESSAGE_SEND_INTERVAL = 5000; // 5 seconds
    const MAX_MESSAGE_LENGTH = 200; // Maximum allowed characters

function sendMessageFromInput() {
    const inputText = messageInput.value.trim();
    if (!inputText) return;

    // Check if the input exceeds the maximum character limit
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

    // If recipient is empty, set it to an appropriate value for public message
    const recipient = recipientName ? recipientName : '#CHANNEL';

    const newMessage = {
        name: PERSON_NAME,
        recipient: recipient,
        text: inputText,
    };

    sendMessage(newMessage);
    lastMessageSentTime = currentTime;

    // Disable the send button temporarily after sending a message
    sendBtn.disabled = true;
    sendBtn.style.visibility = 'hidden'; // Set visibility to 'hidden'
    setTimeout(() => {
        sendBtn.disabled = false;
        sendBtn.style.visibility = 'visible'; // Set visibility back to 'visible'
    }, MESSAGE_SEND_INTERVAL);

    showNotification("Message sent successfully.", true);
}



    
function fetchMessages() {
    const path = window.location.hash || '#'; // Get the current hash value

    // Check if the path is '#chat'
    if (path === '#chat') {
        console.log("path is chat  " + path);
        fetch(apiUrl)
            .then(response => response.json())
            .then(messages => {
                msgerChat.innerHTML = '';
                messages.forEach(message => {
                    // Check if the recipient matches the current user or if it's empty (indicating a message to all users)
                    if (message.recipient === PERSON_NAME || message.recipient === '' || message.recipient === '#CHANNEL') {
                        const createdAt = message.created_at ? new Date(message.created_at * 1000) : null; // Multiply by 1000 to convert seconds to milliseconds
                        const formattedCreatedAt = createdAt ? formatDate(createdAt) : '';
                        const formattedMessage = { ...message, created_at: formattedCreatedAt };
                        addMessage(formattedMessage);
                    }
                });
            })
            .catch(error => console.error('Error fetching messages:', error));
    }
}


    //fetchMessages();
    fetchMessagesInterval = setInterval(fetchMessages, 3000);

    window.addEventListener('unload', () => {
        clearInterval(fetchMessagesInterval);
        console.log("clear interval2");
    });

   

    recipientSelect.addEventListener('change', () => {
        const selectedUser = recipientSelect.value;
        recipientActions.innerHTML = ''; // Clear previous actions

        if (selectedUser) {
            const inviteButton = document.createElement('button');
            inviteButton.textContent = 'Invite to Play';
            inviteButton.addEventListener('click', () => {
                // Implement invite logic here
                console.log(`Inviting ${selectedUser} to play.`);
            });

            const profileButton = document.createElement('button');
            profileButton.textContent = 'Show Profile';
            profileButton.addEventListener('click', () => {
                window.open(`#viewprofile?u=${selectedUser}`, '_blank');
            });
            profileButton.classList.add('msger-msgSend'); // Add the CSS class to style it like the other buttons


            const blockButton = document.createElement('button');
            blockButton.textContent = 'Block private messages';
            blockButton.addEventListener('click', () => {
                // Implement block logic here
                console.log(`Blocking private messages from ${selectedUser}.`);
            });

            recipientActions.appendChild(inviteButton);
            recipientActions.appendChild(profileButton);
            recipientActions.appendChild(blockButton);
        }
    });
}
