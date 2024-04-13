const userLogin = localStorage.getItem('userLogin');
function showPlayersRemote2() {
    const websocketGameUrl = 'wss://localhost:8443/ws/pingpong/';
    const socketgame = new WebSocket(websocketGameUrl);

    
    let connected = false;
    let numberOfPlayers = 0;
    let gameId = null;
    socketgame.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

    socketgame.onclose = function(event) {
        console.log('WebSocket connection closed:', event);
        connected = false; 
    };

    socketgame.onmessage = function(event) {
        console.log('WebSocket message received:', event.data);
        const data = JSON.parse(event.data);

        if (data.keycode !== null) {
            
            console.log('User:', data.userLogin, 'pressed key:', data.keycode);
        }

        
        if (data.numberOfPlayers !== undefined) {
            numberOfPlayers = data.numberOfPlayers;
            if (numberOfPlayers >= 2 && connected) {
                startGame();
            } else {
                console.log('Number of players:', numberOfPlayers);
                console.log('WebSocket connected:', connected);
                displayWaitingMessage();
            }
        }

        
        if (data.gameId !== undefined) {
            gameId = data.gameId;
            console.log('Game ID:', gameId);
        }
    };

    function displayWaitingMessage() {
        const messageContainer = document.getElementById('waitingMessageContainer');
        if (messageContainer) {
            messageContainer.innerText = 'Waiting for the second player to join...';
        }
    }

    function startGame() {
        console.log('Starting the game...');
        clearWaitingMessage();
        gameLoop();
    }

    function clearWaitingMessage() {
        const messageContainer = document.getElementById('waitingMessageContainer');
        if (messageContainer) {
            messageContainer.innerText = ''; 
        }
    }

    
    socketgame.onopen = function(event) {
        console.log('WebSocket connection established.');
        connected = true;
        
        socketgame.send(JSON.stringify({ action: 'check_number_of_players', userLogin: userLogin }));
    };

    const canvas = document.getElementById('canvasremote2');

    if (!canvas) {
        reject(new Error('Canvas element not found'));
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
        speed: 7,
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

    function sendKeycodeToServer(keycode) {
        const message = JSON.stringify({ keycode: keycode });
        socketgame.send(message);
    }
    
    
    window.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp') {
            upArrowPressed = true;
            sendKeycodeToServer('ArrowUp');
        } else if (event.key === 'ArrowDown') {
            downArrowPressed = true;
            sendKeycodeToServer('ArrowDown');
        }
    });
    
    window.addEventListener('keyup', event => {
        if (event.key === 'ArrowUp') {
            upArrowPressed = false;
            sendKeycodeToServer('ArrowUpRelease');
        } else if (event.key === 'ArrowDown') {
            downArrowPressed = false;
            sendKeycodeToServer('ArrowDownRelease');
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
            
            if (upArrowPressed && user.y > 0) {
                user.y -= 8;
            } else if (downArrowPressed && (user.y < canvas.height - user.height)) {
                user.y += 8;
            }

            
            if (ball.velocityX < 0) {
                
                if (ai.y + ai.height / 2 < ball.y) {
                    ai.y += 6;
                } else {
                    ai.y -= 6;
                }
            }
            
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
            //updateGameFromServer();
            update();
            render(); 
        }
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);


    function render() {
        if (!canvas || !ctx) {
            reject(new Error('Canvas element or 2D context not found'));
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
