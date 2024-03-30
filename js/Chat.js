function openChat() {
    const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
    const PERSON_NAME = "user42";
    const onlineUsers = ["eelasam", "ddyankov", "vstockma", "huaydin"];
    const messages = [];

    const onlineUsersElement = document.getElementById('online-users');
    const msgerChat = document.getElementById('msger-chat');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');


    const WebSocketInstance = {
        newChatMessage: function (message) {
            console.log("Sending message to WebSocket:", message);
            addMessage(message);
        }
    };

    function formatDate(date) {
        const h = "0" + date.getHours();
        const m = "0" + date.getMinutes();
        return `${h.slice(-2)}:${m.slice(-2)}`;
    }

    function scrollToBottom() {
        msgerChat.scrollTop = msgerChat.scrollHeight;
    }

    function addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('msg', `${message.side}-msg`);
        const msgInfoName = document.createElement('div');
        msgInfoName.classList.add('msg-info-name');
        msgInfoName.textContent = `${message.time} ${message.name}: ${message.text}`;
        messageElement.appendChild(msgInfoName);
        msgerChat.appendChild(messageElement);
        scrollToBottom();
    }

    sendBtn.addEventListener('click', function () {
        const inputText = messageInput.value.trim();
        if (!inputText) return;
    
        const newMessage = {
            name: PERSON_NAME,
            img: PERSON_IMG,
            side: "right",
            text: inputText,
            time: formatDate(new Date()),
        };
    
        // Create a new message element
        const messageElement = document.createElement('div');
        messageElement.classList.add('msg', 'right-msg'); // Assuming all messages are sent from the right side
        const msgInfoName = document.createElement('div');
        msgInfoName.classList.add('msg-info-name');
        msgInfoName.textContent = `${newMessage.time} ${newMessage.name}: ${newMessage.text}`;
        messageElement.appendChild(msgInfoName);
    
        // Append the new message element below the input area
        msgerChat.parentElement.insertBefore(messageElement, msgerChat.nextSibling);
    
        // Clear the input field
        messageInput.value = '';
    
        // Scroll to the bottom of the chat
        scrollToBottom();
    });
    

    messageInput.addEventListener('keypress', function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); 
            sendBtn.click();
        }
    });

    onlineUsers.forEach(user => {
        // Create the user element (li)
        const userElement = document.createElement('li');
    
        // Create the button element
        const button = document.createElement('button');
        button.classList.add('button', 'bn');
        button.title = 'View Profile';
    
        // Create the span element for the icon
        const spanIcon = document.createElement('span');
        spanIcon.classList.add('bi', 'bi-person');
    
        // Append the span icon to the button
        button.appendChild(spanIcon);
    
        // Append the button to the user element
        userElement.appendChild(button);
    
        // Create a text node for the username
        const userNameNode = document.createTextNode(user);
    
        // Append the username text node to the user element
        userElement.appendChild(userNameNode);
    
        // Append the user element to the online users list
        onlineUsersElement.appendChild(userElement);
    });
    
    
};