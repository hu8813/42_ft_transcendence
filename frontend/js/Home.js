function showHome() {
    const welcomePage = document.querySelector(".welcome-page");
    
    // The welcome message
    const welcomeMessage = document.createElement("div");
    welcomeMessage.classList.add("welcome-message");
    welcomeMessage.textContent = "Welcome to the Pong Game!"
    welcomePage.appendChild(welcomeMessage);

    // The ping-pong ball
    const pongBall = document.createElement("div");
    pongBall.classList.add("ping-pong-ball");
    welcomePage.appendChild(pongBall);

    // The ping-pong table
    const pongTable = document.createElement("div");
    pongTable.classList.add("pong-table");
    
    const leftPaddle = document.createElement("div");
    leftPaddle.classList.add("paddle-left");
    pongTable.appendChild(leftPaddle);

    const rightPaddle = document.createElement("div");
    rightPaddle.classList.add("paddle-right");
    pongTable.appendChild(rightPaddle);
    welcomePage.appendChild(pongTable);
};