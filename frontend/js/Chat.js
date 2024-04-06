function openChat() {
    let PERSON_NAME = localStorage.getItem('userLogin') || "user42";
    const apiUrl = `${getBackendURL()}/api/messages`;
    const onlineUsersElement = document.getElementById('recipient-select');
    const msgerChat = document.getElementById('msger-chat');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const recipientSelect = document.getElementById('recipient-select');
    const recipientActions = document.getElementById('recipient-actions');

    function fetchAllUsers() {
        fetch(`${getBackendURL()}/api/get_all_users`)
            .then(response => response.json())
            .then(users => {
                // Clear existing options
                recipientSelect.innerHTML = '';
                // Add default options
                const defaultOptions = [
                    { value: "", text: "Select recipient" },
                    { value: "", text: "--------" },
                    { value: "#CHANNEL", text: "#CHANNEL" },
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
    }

    fetchAllUsers();

    function formatDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month} ${hours}:${minutes}`;
    }

    function scrollToBottom() {
        msgerChat.scrollTop = msgerChat.scrollHeight;
    }

    function addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('msg');
    
        if (message.name === PERSON_NAME) {
            messageElement.classList.add('right-msg');
        } else {
            messageElement.classList.add('left-msg');
        }
    
        const senderName = message.name || 'Anonymous';
        const createdAt = message.created_at ? message.created_at : '';
        const formattedCreatedAt = formatDate(new Date(createdAt));
    
        messageElement.innerHTML = `
            <div class="msg-info">
                <span class="msg-info-name">${senderName}</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
            <div class="msg-bubble">${message.text}</div>
        `;
    
        msgerChat.appendChild(messageElement);
        scrollToBottom();
    }
    
    function sendMessage(message) {
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
                messageInput.value = '';
            })
            .catch(error => console.error('Error sending message:', error));
    }

    sendBtn.addEventListener('click', function () {
        console.log("Send button clicked");
        sendMessageFromInput();
    });
    
    messageInput.addEventListener('keypress', function (e) {
        console.log("Keypress event triggered");
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessageFromInput();
        }
    });
    
    messageInput.addEventListener('keydown', function (e) {
        console.log("Keydown event triggered");
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessageFromInput();
        }
    });
    

    function sendMessageFromInput() {
        const inputText = messageInput.value.trim();
        if (!inputText) return;
    
        const recipientName = recipientSelect.value;
    
        // If recipient is empty, set it to an appropriate value for public message
        const recipient = recipientName ? recipientName : '#CHANNEL';
    
        const newMessage = {
            name: PERSON_NAME,
            recipient: recipient,
            text: inputText,
        };
    
        sendMessage(newMessage);
    }
    
    
    function fetchMessages() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(messages => {
                msgerChat.innerHTML = '';
                messages.forEach(message => {
                    // Check if the recipient matches the current user or if it's empty (indicating a message to all users)
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
    
    fetchMessages();
    fetchMessagesInterval = setInterval(fetchMessages, 3000);

    window.addEventListener('unload', () => {
        clearInterval(fetchMessagesInterval);
    });

    // onlineUsers.forEach(user => {
    //     const option = document.createElement('option');
    //     option.value = user;
    //     option.textContent = user;
    //     recipientSelect.appendChild(option);
    // });

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
                window.open(`profile/${selectedUser}`, '_blank');
            });
            profileButton.classList.add('msger-send-btn'); // Add the CSS class to style it like the other buttons


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
