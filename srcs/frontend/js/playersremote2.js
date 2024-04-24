function showPlayersRemote2() {
    const websocketGameUrl = 'wss://free.blr2.piesocket.com/v3/1?api_key=pFCnmzaeF3MNOb99XM4dQtkBvXdR0nqlvatFMKKg&notify_self=1';
    const socketgame = new WebSocket(websocketGameUrl);
    const userLogin = localStorage.getItem('userNickname');
    let waitingUsers = new Set(); // Updated to use a Set
    waitingUsers.add(userLogin);
    let connected = false;
    let numberOfPlayers = 0;

    // Define the isPlaying function
    function isPlaying() {
        return waitingUsers.size >= 2 && connected;
    }

    function sendScoreToServer() {
        const message = JSON.stringify({ userLogin: userLogin, score: user.score });
        socketgame.send(message);
    }

    function sendPaddlePositionToServer() {
        const message = JSON.stringify({ userLogin: userLogin, paddleY: user.y });
        socketgame.send(message);
    }

    socketgame.onopen = function(event) {
        connected = true;
        // Add the user to the waiting list
        socketgame.send(JSON.stringify({ action: 'add_user', userLogin: userLogin }));
    };

    socketgame.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

    socketgame.onclose = function(event) {
        connected = false;
    };

    socketgame.onmessage = function(event) {
        const data = JSON.parse(event.data);

        // Add user to waiting list
        if (data.action === 'add_user') {
            waitingUsers.add(data.userLogin);
            if (!isPlaying()) {
                socketgame.send(JSON.stringify({ action: 'response_userLogin', userLogin: userLogin }));
            }
            if (isPlaying()) {
                startGame();
            } else {
                displayWaitingMessage();
            }
        }

        // Remove user from waiting list
        if (data.action === 'remove_user') {
            waitingUsers.delete(data.userLogin);
        }

        // Handle response_userLogin
        if (data.action === 'response_userLogin') {
            if (!waitingUsers.has(data.userLogin)) {
                waitingUsers.add(data.userLogin);
                if (waitingUsers.size >= 2) {
                    startGame();
                }
            }
        }

        // Update paddle position based on key presses from other player
        if (data.paddleY && data.userLogin !== userLogin) {
            user.y = data.paddleY;
        }

        // Sync scores
        if (data.score) {
            // Update the opponent's score
            if (data.userLogin !== userLogin) {
                ai.score = data.score;
            }
        }
    };

    function displayWaitingMessage() {
        const messageContainer = document.getElementById('waitingMessageContainer');
        if (messageContainer) {
            messageContainer.innerText = 'Waiting for the second player to join...';
        }
    }

    function startGame() {
        clearWaitingMessage();
        
        // Check if there are at least two waiting users
        if (waitingUsers.size >= 2) {
            const playerArray = Array.from(waitingUsers);
            const player1 = playerArray[0];
            const player2 = playerArray[1];
            
            // Assign players to paddles
            if (player1 === userLogin) {
                // Player 1 controls the left paddle
                user.color = '#00FF00'; // Example color change for differentiation
                ai.color = '#FFF'; // Reset color for AI paddle
            } else {
                // Player 2 controls the left paddle
                user.color = '#FFF'; // Reset color for user paddle
                ai.color = '#00FF00'; // Example color change for differentiation
            }

            numberOfPlayers = 2;
            connected = true;
            gameLoop();
        } else {
            displayWaitingMessage();
        }
    }

    function clearWaitingMessage() {
        const messageContainer = document.getElementById('waitingMessageContainer');
        if (messageContainer) {
            messageContainer.innerText = '';
        }
    }

    const canvas = document.getElementById('canvasremote2');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const netWidth = 4;
    const netHeight = canvas.height;

    const paddleWidth = 10;
    const paddleHeight = 50;

    let upArrowPressed = false;
    let downArrowPressed = false;
    const ctx = canvas.getContext('2d'); 

    const net = {
        x: canvas.width / 2 - netWidth / 2,
        y: 0,
        width: netWidth,
        height: netHeight,
        color: "#FFF"
    };

    const user = {
        x: 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#FFF',
        score: 0
    };

    const ai = {
        x: canvas.width - (paddleWidth + 10),
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#FFF',
        score: 0
    };

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 7,
        speed: 3,
        velocityX: 5,
        velocityY: 5,
        color: '#ffffff'
    };

    function drawNet() {
        ctx.fillStyle = net.color;
        ctx.fillRect(net.x, net.y, net.width, net.height);
    }

    function drawScore(x, y, score) {
        ctx.fillStyle = '#fff';
        ctx.font = '35px sans-serif';
        ctx.fillText(score, x, y);
    }

    function drawPaddle(x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }

    function drawBall(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
    
    window.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp') {
            upArrowPressed = true;
        } else if (event.key === 'ArrowDown') {
            downArrowPressed = true;
        }
    });
    
    window.addEventListener('keyup', event => {
        if (event.key === 'ArrowUp') {
            upArrowPressed = false;
        } else if (event.key === 'ArrowDown') {
            downArrowPressed = false;
        }
    });

    function collisionDetect(player, ball) {
        player.top = player.y;
        player.right = player.x + player.width;
        player.bottom = player.y + player.height;
        player.left = player.x;

        ball.top = ball.y - ball.radius;
        ball.right = ball.x + ball.radius;
        ball.bottom = ball.y + ball.radius;
        ball.left = ball.x - ball.radius;

        return ball.left < player.right && ball.top < player.bottom && ball.right > player.left && ball.bottom > player.top;
    }

    function checkGameOver() {
        if (user.score === 7 || ai.score === 7) {
            gameOver = true;
            let winner = user.score === 7 ? "Spieler 1 gewinnt!" : "Spieler 2 gewinnt!";
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.fillText(winner, canvas.width / 4, canvas.height / 2);

            showNewGameButtonRemote2();
        }
    }

    let gameOver = false; 

    function update() {
        if (!gameOver && numberOfPlayers === 2 && connected) {
            // Update user's paddle position based on keypresses
            if (upArrowPressed && user.y > 0) {
                user.y -= 8;
            } else if (downArrowPressed && (user.y < canvas.height - user.height)) {
                user.y += 8;
            }
            // Send paddle movement to the server
            sendPaddlePositionToServer();
            
            // Send the user's score to the server for synchronization
            sendScoreToServer();

            ball.x += ball.velocityX;
            ball.y += ball.velocityY;

            if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
                ball.velocityY = -ball.velocityY;
            }

            if (ball.x + ball.radius >= canvas.width) {
                user.score += 1;
                reset();
            } else if (ball.x - ball.radius <= 0) {
                ai.score += 1;
                reset();
            }

            let player = (ball.x < canvas.width / 2) ? user : ai;
            if (collisionDetect(player, ball)) {
                let angle = 0;
                if (ball.y < (player.y + player.height / 2)) {
                    angle = -1 * Math.PI / 4;
                } else if (ball.y > (player.y + player.height / 2)) {
                    angle = Math.PI / 4;
                }
                ball.velocityX = (player === user ? 1 : -1) * ball.speed * Math.cos(angle);
                ball.velocityY = ball.speed * Math.sin(angle);

                ball.speed += 0.1; 
            }

            checkGameOver();
        }
    }

    function reset() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = -ball.velocityX;
        ball.speed = 7;
    }

    function gameLoop() {
        if (!gameOver) {
            update();
            render(); 
        }
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);

    function render() {
        if (!canvas || !ctx) {
            console.error('Canvas element or 2D context not found');
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawNet();
        drawScore(canvas.width / 4, canvas.height / 6, user.score);
        drawScore(3 * canvas.width / 4, canvas.height / 6, ai.score);
        drawPaddle(user.x, user.y, user.width, user.height, user.color);
        drawPaddle(ai.x, ai.y, ai.width, ai.height, ai.color);
        drawBall(ball.x, ball.y, ball.radius, ball.color);
    }

    function showNewGameButtonRemote2() {
        const button = document.getElementById('newGameButtonremote2');
        button.style.display = 'block'; 
    }

    document.getElementById('newGameButtonremote2').addEventListener('click', function() {
        location.reload(); 
    });
}
