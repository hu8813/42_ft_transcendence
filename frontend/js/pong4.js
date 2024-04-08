function showPong4() 
{

    const canvas = document.getElementById('canvasp4');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let wPressed = false;
    let sPressed = false;
    let upArrowPressed = false;
    let downArrowPressed = false;
    let jPressed = false;
    let kPressed = false;
    let gameOver = false;
    let isGamePaused = false;

    const paddleWidth = 10;
    const paddleHeight = 100;

    // Spielerdefinitionen
    const player1 = {
        x: 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#333333',
        score: 0
    };

    const player2 = {
        x: canvas.width - paddleWidth - 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#333333',
        score: 0
    };

    const player3 = {
        x: canvas.width / 2 - paddleHeight / 2,
        y: canvas.height - paddleWidth - 10,
        width: paddleHeight,
        height: paddleWidth,
        color: '#333333',
        score: 0
    };

    const player4 = {
        x: canvas.width / 2 - paddleHeight / 2,
        y: 10,
        width: paddleHeight,
        height: paddleWidth,
        color: '#333333',
        score: 0
    };

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 7,
        speed: 7,
        velocityX: 5,
        velocityY: 5,
        color: '#333333'
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);

    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === 'hidden') {
            isGamePaused = true;
        } else {
            isGamePaused = false;
        }
    });

    function keyDownHandler(event) {
        switch (event.keyCode) {
            case 87: // W
                wPressed = true;
                break;
            case 83: // S
                sPressed = true;
                break;
            case 38: // Up Arrow
                upArrowPressed = true;
                event.preventDefault();
                break;
            case 40: // Down Arrow
                downArrowPressed = true;
                event.preventDefault();
                break;
            case 74: // J
                jPressed = true;
                break;
            case 75: // K
                kPressed = true;
                break;
        }
    }

    function keyUpHandler(event) {
        switch (event.keyCode) {
            case 87: // W
                wPressed = false;
                break;
            case 83: // S
                sPressed = false;
                break;
            case 38: // Up Arrow
                upArrowPressed = false;
                event.preventDefault();
                break;
            case 40: // Down Arrow
                downArrowPressed = false;
                event.preventDefault();
                break;
            case 74: // J
                jPressed = false;
                break;
            case 75: // K
                kPressed = false;
                break;
        }
    }

    function mouseMoveHandler(event) {
        let canvasRect = canvas.getBoundingClientRect();
        let scaleX = canvas.width / canvasRect.width; // die Skalierung der Breite
        let scaleY = canvas.height / canvasRect.height; // die Skalierung der Höhe
    
        let mouseX = (event.clientX - canvasRect.left) * scaleX; // Skaliere die Mauskoordinate X
        // Begrenze den Paddle-Bereich innerhalb des Canvas und berücksichtige die Skalierung
        player3.x = Math.max(Math.min(mouseX - (player3.width / 2), canvas.width - player3.width), 0);
    }

    function collisionDetect(player, ball) {
        player.top = player.y;
        player.right = player.x + player.width;
        player.bottom = player.y + player.height;
        player.left = player.x;
    
        ball.top = ball.y - ball.radius;
        ball.right = ball.x + ball.radius;
        ball.bottom = ball.y + ball.radius;
        ball.left = ball.x - ball.radius;
    
        // Bedingung für Spieler 3: Ball darf unten durchgehen
        if (player === player3 && ball.bottom > player.top) {
            return false;
        }
    
        // Bedingung für Spieler 4: Ball darf oben durchgehen
        if (player === player4 && ball.top < player.bottom) {
            return false;
        }
    
        return ball.right > player.left && ball.top < player.bottom && ball.left < player.right && ball.bottom > player.top;
    }
    

    function handlePaddleBallCollision(player, ball) {
        let collidePoint = (player === player3 || player === player4) ? 
            (ball.x - (player.x + player.width / 2)) / (player.width / 2) : 
            (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        
        let angleRad = collidePoint * (Math.PI / 4);
        let direction = (player === player2 || player === player4) ? -1 : 1;
        
        if (player === player3 || player === player4) {
            ball.velocityY = direction * ball.speed * Math.cos(angleRad);
            ball.velocityX = ball.speed * Math.sin(angleRad);
        } else {
            ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityY = ball.speed * Math.sin(angleRad);
        }
        
        ball.speed += 0.1;
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speed = 7;
        ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
        ball.velocityY = (Math.random() * 2 - 1) * ball.speed;
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
    function drawScore() {
        ctx.fillStyle = "#ff0000";
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
    
        // Angenommener Abstand vom Rand in Pixel (1cm entspricht ca. 37.7952755906px bei 96dpi)
        // Für Demonstrationszwecke nehmen wir einen gerundeten Wert, z.B. 38px, als Abstand.
        let offset = 38;
    
        ctx.fillText(player1.score, paddleWidth + offset, canvas.height / 2);
        ctx.fillText(player2.score, canvas.width - paddleWidth - offset, canvas.height / 2);
        ctx.fillText(player3.score, canvas.width / 2, canvas.height - paddleHeight - offset);
        ctx.fillText(player4.score, canvas.width / 2, paddleHeight + offset);
    }
    
    

    function showGameOverModal() {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#FFF";
        ctx.font = "40px Arial";
        let gameOverText = "Game Over";
        ctx.fillText(gameOverText, canvas.width / 2 - ctx.measureText(gameOverText).width / 2, canvas.height / 2 - 20);

        document.getElementById('nGButton').style.display = 'block';
    }

    function update() {
        //if (isGamePaused) return;

        if (gameOver) {
            showGameOverModal();
            return;
        }

        if (wPressed && player1.y > 0) player1.y -= 8;
        if (sPressed && player1.y < canvas.height - player1.height) player1.y += 8;
        if (upArrowPressed && player2.y > 0) player2.y -= 8;
        if (downArrowPressed && player2.y < canvas.height - player2.height) player2.y += 8;
        if (jPressed && player4.x > 0) player4.x -= 8;
        if (kPressed && player4.x < canvas.width - player4.width) player4.x += 8;

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.velocityY = -ball.velocityY;
        }

        if (ball.x - ball.radius < 0) {
            player2.score++;
            if (player2.score === 7) {
                gameOver = true;
            }
            resetBall();
        } else if (ball.x + ball.radius > canvas.width) {
            player1.score++;
            if (player1.score === 7) {
                gameOver = true;
            }
            resetBall();
        }

        if (collisionDetect(player1, ball)) handlePaddleBallCollision(player1, ball);
        if (collisionDetect(player2, ball)) handlePaddleBallCollision(player2, ball);
        if (collisionDetect(player3, ball)) handlePaddleBallCollision(player3, ball);
        if (collisionDetect(player4, ball)) handlePaddleBallCollision(player4, ball);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle(player1.x, player1.y, player1.width, player1.height, player1.color);
        drawPaddle(player2.x, player2.y, player2.width, player2.height, player2.color);
        drawPaddle(player3.x, player3.y, player3.width, player3.height, player3.color);
        drawPaddle(player4.x, player4.y, player4.width, player4.height, player4.color);
        drawBall(ball.x, ball.y, ball.radius, ball.color);
        drawScore();
    }

    function gameLoop() {
        update();
        draw();
        if (!gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    gameLoop();
}