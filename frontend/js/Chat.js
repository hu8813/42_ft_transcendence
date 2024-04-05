function openChat() {
    const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
    const PERSON_NAME = "user42";
    const onlineUsers = ["eelasam", "ddyankov", "vstockma", "huaydin"];
    const messages = [];

    const onlineUsersElement = document.getElementById('online-users');
    const msgerChat = document.getElementById('msger-chat');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');


    const iframe = document.createElement("iframe");
    iframe.src = "https://pong42.azurewebsites.net/chat/"; // Replace with your URL
    iframe.width = "100%";
    iframe.height = "100%"; // Adjust height as needed

    // Append iframe to msger-chat
    //msgerChat.appendChild(iframe);

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
    
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('msg', 'right-msg'); 
        const msgInfoName = document.createElement('div');
        msgInfoName.classList.add('msg-info-name');
        msgInfoName.textContent = `${newMessage.time} ${newMessage.name}: ${newMessage.text}`;
        messageElement.appendChild(msgInfoName);
    
        
        msgerChat.parentElement.insertBefore(messageElement, msgerChat.nextSibling);
        

        
        messageInput.value = '';
    
        
        scrollToBottom();
    });
    

    messageInput.addEventListener('keypress', function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); 
            sendBtn.click();
        }
    });

    onlineUsers.forEach(user => {
        
        const userElement = document.createElement('li');
    
        
        const button = document.createElement('button');
        button.classList.add('button', 'bn');
        button.title = 'View Profile';
    
        
        const spanIcon = document.createElement('span');
        spanIcon.classList.add('bi', 'bi-person');
    
        
        button.appendChild(spanIcon);
    
        
        userElement.appendChild(button);
    
        
        const userNameNode = document.createTextNode(user);
    
        
        userElement.appendChild(userNameNode);
    
        
        onlineUsersElement.appendChild(userElement);
    });
    
    
};