function showHome() {
    const welcomePage = document.querySelector(".welcome-page");
    
    // welcome message
    const welcomeMessage = document.createElement("div");
    welcomeMessage.classList.add("welcome-message");
    welcomeMessage.id = "welcome";

    if (translateKey('home.welcome').then((value) => {welcomeMessage.textContent = value;}));
    welcomePage.appendChild(welcomeMessage);

    // ping-pong table
    const pongTable = document.createElement("div");
    pongTable.classList.add("pong-table");
    
    pongTable.onmouseover = () => {
        welcomeMessage.textContent = "Please login to play!"
        if (translateKey('home.logintoplay').then((value) => {welcomeMessage.textContent = value;}));

        const leftPaddle = document.querySelector(".paddle-left");
        const rightPaddle = document.querySelector(".paddle-right");
        const pongBall = document.querySelector(".ping-pong-ball");
        const pongTable = document.querySelector(".pong-table");
        
        pongTable.onmousemove = (event) => {
            const y = event.clientY - pongTable.offsetTop;
            const leftPaddleTop = Math.min(70, Math.max(0, y - 25)) + '%'; // Adjusted for percentage
            leftPaddle.style.top = leftPaddleTop;
            
            const rightPaddleTop = Math.min(70, Math.max(0, y - 25)) + '%'; // Adjusted for percentage
            rightPaddle.style.top = rightPaddleTop;
        };
    };
    
    // ping-pong ball
    const pongBall = document.createElement("div");
    pongBall.classList.add("ping-pong-ball");
    
    // position of the ball
    const ballTop = 'calc((80vh - 4vw) / 2)'; // Adjusted for vw and vh
    const ballLeft = 'calc((80vw - 4vw) / 2)'; // Adjusted for vw and vh
    pongBall.style.top = ballTop;
    pongBall.style.left = ballLeft;
    
    const leftPaddle = document.createElement("div");
    leftPaddle.classList.add("paddle-left");
    pongTable.appendChild(leftPaddle);
    
    const rightPaddle = document.createElement("div");
    rightPaddle.classList.add("paddle-right");
    pongTable.appendChild(rightPaddle);
    pongTable.appendChild(pongBall);
    welcomePage.appendChild(pongTable);
};
