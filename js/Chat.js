document.addEventListener('DOMContentLoaded', function () {
    const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
    const PERSON_NAME = "user42";
    const onlineUsers = ["John", "Alice", "Bob"];
    const messages = [];

    const onlineUsersElement = document.getElementById('online-users');
    const msgerChat = document.getElementById('msger-chat');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    // Mock WebSocket instance
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

        WebSocketInstance.newChatMessage(newMessage);
        messageInput.value = '';
    });

    messageInput.addEventListener('keypress', function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent form submission
            sendBtn.click();
        }
    });

    // Populate online users
    onlineUsers.forEach(user => {
        const userElement = document.createElement('li');
        userElement.textContent = user;
        onlineUsersElement.appendChild(userElement);
    });
});
