function openChat() {
    const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
    const PERSON_NAME = "user42";
    const onlineUsers = ["eelasam", "ddyankov", "vstockma", "huaydin"];
    const messages = [];

    const onlineUsersElement = document.getElementById('online-users');
    const msgerChat = document.getElementById('msger-chat');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    const socket = new WebSocket("wss://pong42.azurewebsites.net/chat/"); // Replace with your WebSocket URL

    socket.onopen = function(event) {
        console.log("WebSocket connection established.");
    };

    socket.onmessage = function(event) {
        const receivedMessage = JSON.parse(event.data);
        addMessage(receivedMessage);
    };

    function sendMessage(message) {
        socket.send(JSON.stringify(message));
    }

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

        sendMessage(newMessage);

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
}
