let socket;
let messageInput;
let recipientSelect;
let onlineUsersList; 
let NOTIFICATION_DURATION = 2000;
let MAX_RETRIES = 3;
let retryCount = 0;
let isDisconnected = false;
let lastMessageSentTime = 0;
const MESSAGE_SEND_INTERVAL = 5000;
const MAX_MESSAGE_LENGTH = 200;
let storedMessages;
let msgerChat;
let blockedUsers = [];

let userNickname2; 

async function getBlockedUsers() {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const csrfToken = await getCSRFCookie();

        const response = await fetch('/api/get-blocked-users/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch blocked users');
        }

        const responseData = await response.json();
        const blockedUsers = responseData.blocked_users || [];
        //console.log('Blocked users:', blockedUsers);
        
        return blockedUsers; // Return the blocked users array
    } catch (error) {
        console.error('Error fetching blocked users:', error);
        throw error; // Rethrow the error to be caught by the caller
    }
}


async function isUserBlocked(username) {
    return await getBlockedUsers().then(function(blockedUsers) {
        if (blockedUsers) {
            //console.log('Blocked users:', blockedUsers, 'len:', blockedUsers.length);
            if (blockedUsers.length > 0) {
                let incs = blockedUsers.includes(username);
                //console.log("inc:" + incs);
                return incs;
            } else {
                //console.log('No blocked users found.');
                return false;
            }
        } else {
            //console.log('Blocked users data is undefined.');
            return false;
        }
    }).catch(function(error) {
        console.error('Error checking if user is blocked:', error);
        return false;
    });
}




async function addfriend(username) {  
    try {
        let jwtToken = localStorage.getItem('jwtToken');
        let csrfToken = await getCSRFCookie();

        
        const response = await fetch(`/api/add-friend?username=${username}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            }
        });
        
        const responseData = await response.json();
        if (response.ok) {
            // messageContainer.textContent = responseData.message;
            // messageContainer.style.color = 'green';
            showNotification(responseData.message, true);
        } else {
            throw new Error('Failed to add friend '+responseData.message);
        }
    } catch (error) {
        console.error('Error adding friend:', error);
        // messageContainer.textContent = 'Opps '+error.message;
        // messageContainer.style.color = 'red';
        showNotification(responseData.message, false);
    }
}

async function blockUser(username) {  
    try {
        let jwtToken = localStorage.getItem('jwtToken');
        let csrfToken = await getCSRFCookie();

        
        const response = await fetch(`/api/block-user?username=${username}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            }
        });
        
        const responseData = await response.json();
        if (response.ok) {
            // messageContainer.textContent = responseData.message;
            // messageContainer.style.color = 'green';
            showNotification(responseData.message, true);
        } else {
            throw new Error('Failed to block user '+responseData.message);
        }
    } catch (error) {
        console.error('Error blocking user:', error);
        // messageContainer.textContent = 'Opps '+error.message;
        // messageContainer.style.color = 'red';
        showNotification(responseData.message, false);
    }
}

function toggleSocketConnection() {
    if (isDisconnected) {
        socket = getWebSocket();
        document.getElementById('msgDisconnect').textContent = 'Disconnect';
    } else {
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log('WebSocket disconnected.');
            const leftMessage = {
                text: 'left the chat',
                name: localStorage.getItem('userNickname')  || "user42"
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
            if (!userNickname2 || userNickname2 === 'null' || userNickname2 === 'undefined' || userNickname2 === 'Anonymous')
                userNickname2 = localStorage.getItem('userNickname')  || "user42";
            const joinMessage = {
                text: 'joined the chat',
                name: userNickname2
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


function sendMessage(message) {
    message.created_at = new Date(); 
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        showNotification("Message sent successfully.", true);
    } else {
        console.error('WebSocket connection is not open.');
        showNotification("You are disconnected. Trying to reconnect...", false);
        toggleSocketConnection();
        setTimeout(() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                showNotification("Reconnected. Message sent successfully.", true);
                const joinMessage3 = {
                    text: 'joined the chat',
                    name:  localStorage.getItem('userNickname')  || "user42"
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
async function displayMessage(message) {
    msgerChat = document.getElementById('msger-chat');
    const messageElement = document.createElement('div');
    messageElement.classList.add('msg');

    const isCurrentUser = message.name === (localStorage.getItem('userNickname') || "user42");
    const alignRight = isCurrentUser ? 'right' : 'left';
    messageElement.classList.add(isCurrentUser ? 'right-msg' : 'left-msg');
    messageElement.classList.add('msg-bubble');
    const senderName = message.name || 'Anonymous';
    const formattedCreatedAt = message.created_at ? formatDate(new Date(message.created_at)) : getCurrentTimestamp();

    if (messageElement && message && message.text && message.text.includes("joined the chat")) {
        messageElement.innerHTML = `
            <div class="msg-info" style="text-align: ${alignRight};">
                <span class="msg-info-name" style="color: green;">${escapeHTML(senderName)} has joined the chat</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
        `;
        updateOnlineUsers();
    } else if (messageElement && message && message.text && message.text.includes("left the chat")) {
        messageElement.innerHTML = `
            <div class="msg-info" style="text-align: ${alignRight};">
                <span class="msg-info-name" style="color: red;">${escapeHTML(senderName)} has left the chat</span>
                <span class="msg-info-time">${formattedCreatedAt}</span>
            </div>
        `;
        updateOnlineUsers();
    } else {
        const recipient = message.recipient || '#General';

        if (recipient === '#General' || recipient === null || recipient === undefined || recipient === userNickname2) {
            if (message.name && !(await isUserBlocked(message.name))) {
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
        } else if (recipient !== userNickname2) {
            return;
        }
    }

    if (msgerChat)
        msgerChat.prepend(messageElement);

    saveMessageToLocal(message);
}
 

async function updateOnlineUsers() {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        let csrfToken = await getCSRFCookie();

        const response = await fetch('/api/get-online-users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch online users');
        }
        const responseData = await response.json();
        if (responseData.error) {
            console.log("No users are currently online.");
            return;
        }
        const { online_users } = responseData;

        onlineUsersList.innerHTML = '';
        online_users.forEach(user => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        
            const userContainer = document.createElement('div');
            userContainer.classList.add('d-flex', 'align-items-center');
        
            const userImage = document.createElement('img');
            userImage.src = user.image_link || './src/emptyavatar.jpeg';
            userImage.alt = user.nickname;
            userImage.width = 32;
            userImage.height = 32;
            userImage.classList.add('rounded-circle', 'mr-3');
            userContainer.appendChild(userImage);
        
            const userInfo = document.createElement('div');
            const nickname = document.createElement('span');
            nickname.textContent = user.nickname;
            userInfo.appendChild(nickname);
            userContainer.appendChild(userInfo);
        
            listItem.appendChild(userContainer);
        
            const linksContainer = document.createElement('div');
            linksContainer.classList.add('user-links', 'd-none');
        
            const viewProfileLink = document.createElement('a');
            viewProfileLink.href = `/#viewprofile?u=${user.username}`;
            viewProfileLink.classList.add('btn', 'btn-info', 'btn-sm', 'mr-1');
            viewProfileLink.innerHTML = '<i class="bi bi-search"></i> View Profile';
            viewProfileLink.target = '_blank';
            linksContainer.appendChild(viewProfileLink);
        
            const addFriendLink = document.createElement('a');
            addFriendLink.href = `/#add-friend?u=${user.username}`;
            addFriendLink.classList.add('btn', 'btn-success', 'btn-sm', 'mr-1');
            addFriendLink.innerHTML = '<i class="bi bi-plus"></i> Add Friend';
            addFriendLink.addEventListener('click', async (event) => {
                event.preventDefault();
                try {
                    let jwtToken = localStorage.getItem('jwtToken');
                    let csrfToken = await getCSRFCookie();
        
                    const response = await fetch(`/api/add-friend?username=${user.username}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
        
                    const responseData = await response.json();
                    if (response.ok) {
                        //messageContainer.textContent = responseData.message;
                        //messageContainer.style.color = 'green';
                        showNotification(responseData.message, true);
                    } else {
                        throw new Error('Failed to add friend ' + responseData.message);
                    }
                } catch (error) {
                    console.error('Error adding friend:', error);
                    showNotification('Oops, ' + error.message, false);
                }
            });
            linksContainer.appendChild(addFriendLink);
        
            const blockLink = document.createElement('a');
            blockLink.href = `/block/${user.nickname}`;
            blockLink.classList.add('btn', 'btn-danger', 'btn-sm', 'mr-1');
            blockLink.innerHTML = '<i class="bi bi-dash"></i> Block';
            blockLink.addEventListener('click', async (event) => {
                event.preventDefault();
                try {
                    let jwtToken = localStorage.getItem('jwtToken');
                    let csrfToken = await getCSRFCookie();
        
                    const response = await fetch(`/api/block-user?username=${user.username}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
        
                    const responseData = await response.json();
                    if (response.ok) {
                        // messageContainer.textContent = responseData.message;
                        // messageContainer.style.color = 'green';
                        showNotification(responseData.message, true);
                    } else {
                        throw new Error('Failed to block user ' + responseData.message);
                    }
                } catch (error) {
                    console.error('Error blocking user:', error);
                    showNotification('Oops, ' + error.message, false);
                }
            });
        
            linksContainer.appendChild(blockLink);
        
            const sendMessageBtn = document.createElement('button');
            sendMessageBtn.innerHTML = '<i class="bi bi-envelope"></i> Send Message';
            sendMessageBtn.classList.add('btn', 'btn-primary', 'btn-sm');
            sendMessageBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                const message = prompt('Enter your message:');
                if (message) {
                    sendMessageToUser(user.nickname, message);
                }
            });
            linksContainer.appendChild(sendMessageBtn);
        
            // Invite to Play link
            const inviteToPlayLink = document.createElement('a');
            inviteToPlayLink.href = '#'; // Provide a proper link to handle sending an invitation
            inviteToPlayLink.classList.add('btn', 'btn-warning', 'btn-sm', 'mr-1');
            inviteToPlayLink.innerHTML = '<i class="bi bi-controller"></i> Invite to Play';
            inviteToPlayLink.addEventListener('click', async (event) => {
                event.preventDefault();
                wanttoplay = await translateKey('wanttoplay');
                const message = `${user.nickname}, ${wanttoplay}`; // Customize the invitation message
                sendMessageToUser(user.nickname, message);
            });
            linksContainer.appendChild(inviteToPlayLink);
        
            listItem.appendChild(linksContainer);
        
            listItem.addEventListener('click', () => {
                //recipientSelect.value = user.username;
        
                linksContainer.classList.toggle('d-none');
            });
            onlineUsersList.appendChild(listItem);
        });
        
    } catch (error) {
        console.error('Error fetching online users:', error);
    }
}

function playNotificationSound() {
    if (Audio && typeof Audio === 'function') {
        const audio = new Audio('./src/notify.wav');
        document.addEventListener('click', () => {
            audio.play()
                .catch(error => {
                    console.error('Failed to play notification sound:', error);
                });
            document.removeEventListener('click', playNotificationSound);
        }, { once: true }); 
    }
}


async function openChat() {
    if (!chatChannel)
        chatChannel = '#General';
    userNickname2= localStorage.getItem('userNickname') || "user42";
    messageInput = document.getElementById('message-input');
    //blockedUsers = await getBlockedUsers();
    //recipientSelect = document.getElementById('recipient-select');
    onlineUsersList = document.getElementById('online-users-list'); 
    const sendBtn = document.getElementById('msgSend');
    const msgDisconnect = document.getElementById('msgDisconnect');
    msgerChat = document.getElementById('msger-chat');

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessageFromInput);
    }

    if (msgDisconnect) {
        msgDisconnect.addEventListener('click', toggleSocketConnection);
    }

    if (messageInput)
    {
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
}
    socket = getWebSocket();
    if (msgerChat.childElementCount === 0) {
        storedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        storedMessages.forEach(message => displayMessage(message));
    }

    
    updateOnlineUsers();

}


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

    let recipientName;
    let recipient = recipientName ? recipientName : '#General';

    const newMessage = {
        name:  localStorage.getItem('userNickname') || "user42",
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


function sendMessageToUser(nickname, message) {
    const newMessage = {
        name:   localStorage.getItem('userNickname')  || "user42",
        recipient: nickname,
        text: message,
    };
    sendMessage(newMessage);
}




function escapeHTML(text) {
    const escapeChars = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    if (typeof text !== 'string' || text === undefined || text === null) {
        return text;
    }
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
    if (!notification) return;
    notification.textContent = message;
    notification.style.color = isSuccess ? 'green' : 'red';
    setTimeout(() => {
        if (notification)
            notification.textContent = '';
    }, NOTIFICATION_DURATION);
}
