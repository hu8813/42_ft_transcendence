function showHome() {
    const welcomePage = document.querySelector(".welcome-page");
    
    // welcome message
    const welcomeMessage = document.createElement("div");
    welcomeMessage.classList.add("welcome-message");
    welcomeMessage.textContent = "Welcome to the Pong Game!"
    welcomePage.appendChild(welcomeMessage);

    // ping-pong table
    const pongTable = document.createElement("div");
    pongTable.classList.add("pong-table");
    
    // ping-pong ball
    const pongBall = document.createElement("div");
    pongBall.classList.add("ping-pong-ball");
    
    // position of the ball
    const ballTop = (400 - 2 * 2) / 2;
    const ballLeft = (600 - 2 * 2) / 2;
    pongBall.style.top = ballTop + "px";
    pongBall.style.left = ballLeft + "px";
    
    const leftPaddle = document.createElement("div");
    leftPaddle.classList.add("paddle-left");
    pongTable.appendChild(leftPaddle);
    
    const rightPaddle = document.createElement("div");
    rightPaddle.classList.add("paddle-right");
    pongTable.appendChild(rightPaddle);
    pongTable.appendChild(pongBall);
    welcomePage.appendChild(pongTable);
};