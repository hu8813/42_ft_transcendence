function showHome() {
    const welcomePage = document.querySelector(".welcome-page");
    
    
    const welcomeMessage = document.createElement("div");
    welcomeMessage.classList.add("welcome-message");
    welcomeMessage.id = "welcome";

    if (welcomePage)
    {
        if (translateKey('welcome').then((value) => {welcomeMessage.textContent = value;}));
        welcomePage.appendChild(welcomeMessage);
    }    
    
    const pongTable = document.createElement("div");
    pongTable.classList.add("pong-table");
    
    pongTable.onmouseover = () => {
        if (localStorage.getItem("isLoggedIn") !== 'true' && welcomeMessage)  {
            welcomeMessage.textContent = "Please login to play!"
            if (translateKey('logintoplay').then((value) => {welcomeMessage.textContent = value;}));

        }
        else if (localStorage.getItem("isLoggedIn") === 'true' && welcomeMessage && localStorage.getItem("userNickname") !== null) {
            if (translateKey('profile-title').then((value) => {welcomeMessage.textContent = value + " " + localStorage.getItem("userNickname");}));
        }


        const leftPaddle = document.querySelector(".paddle-left");
        const rightPaddle = document.querySelector(".paddle-right");
        const pongBall = document.querySelector(".ping-pong-ball");
        const pongTable = document.querySelector(".pong-table");
        
    };
    
    
    const pongBall = document.createElement("div");
    pongBall.classList.add("ping-pong-ball");
    
    
    const ballTop = 'calc(50% - 1vw)'; 
    const ballLeft = 'calc(50% - 1vw)'; 
    pongBall.style.top = ballTop;
    pongBall.style.left = ballLeft;
    
    const leftPaddle = document.createElement("div");
    leftPaddle.classList.add("paddle-left");
    pongTable.appendChild(leftPaddle);
    
    const rightPaddle = document.createElement("div");
    rightPaddle.classList.add("paddle-right");
    pongTable.appendChild(rightPaddle);
    pongTable.appendChild(pongBall);
    if (welcomePage)
        welcomePage.appendChild(pongTable);
};
