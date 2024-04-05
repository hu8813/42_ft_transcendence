function showPong3() {
    const canvas = document.getElementById('canvasehab');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let wPressed = false;
    let sPressed = false;
    let upArrowPressed = false;
    let downArrowPressed = false;

    const netWidth = 4;
    const netHeight = canvas.height;

    const paddleWidth = 10;
    const paddleHeight = 50;

    const user = {
        x: 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#FFF',
        score: 0
    };

    const player2 = {
        x: canvas.width - (paddleWidth + 10),
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#FFF',
        score: 0
    };

    // Dritter Spieler am unteren Rand
    const player3 = {
        x: canvas.width / 2 - 50 / 2,
        y: canvas.height - paddleHeight - 10,
        width: 100,
        height: paddleHeight,
        color: '#FFF',
    };

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 7,
        speed: 7,
        velocityX: 5,
        velocityY: 5,
        color: '#FFF'
    };

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    canvas.addEventListener('mousemove', mouseMoveHandler);

    function keyDownHandler(event) {
        switch(event.keyCode) {
            case 87: // W
                wPressed = true;
                break;
            case 83: // S
                sPressed = true;
                break;
            case 38: // Up Arrow
                upArrowPressed = true;
                break;
            case 40: // Down Arrow
                downArrowPressed = true;
                break;
        }
    }

    function keyUpHandler(event) {
        switch(event.keyCode) {
            case 87: // W
                wPressed = false;
                break;
            case 83: // S
                sPressed = false;
                break;
            case 38: // Up Arrow
                upArrowPressed = false;
                break;
            case 40: // Down Arrow
                downArrowPressed = false;
                break;
        }
    }

    function mouseMoveHandler(event) {
        let rect = canvas.getBoundingClientRect();
        player3.x = event.clientX - rect.left - player3.width / 2;
        // Beschränkt die Bewegung des dritten Schlägers innerhalb des Canvas
        if (player3.x < 0) {
            player3.x = 0;
        } else if (player3.x + player3.width > canvas.width) {
            player3.x = canvas.width - player3.width;
        }
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

        return ball.right > player.left && ball.top < player.bottom && ball.left < player.right && ball.top > player.top;
    }

    function update() {
        if (wPressed) {
            user.y = Math.max(user.y - 8, 0);
        } else if (sPressed) {
            user.y = Math.min(user.y + 8, canvas.height - user.height);
        }

        if (upArrowPressed) {
            player2.y = Math.max(player2.y - 8, 0);
        } else if (downArrowPressed) {
            player2.y = Math.min(player2.y + 8, canvas.height - player2.height);
        }

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.velocityY = -ball.velocityY;
        }

        if (ball.x - ball.radius < 0) {
            player2.score++;
            resetBall();
        } else if (ball.x + ball.radius > canvas.width) {
            user.score++;
            resetBall();
        }

        if (collisionDetect(user, ball) || collisionDetect(player2, ball) || collisionDetect(player3, ball)) {
            ball.velocityX = -ball.velocityX;
        }
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = -ball.velocityX;
        ball.speed = 7;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle(user.x, user.y, user.width, user.height, user.color);
        drawPaddle(player2.x, player2.y, player2.width, player2.height, player2.color);
        // Zeichnet den dritten Schläger
        drawPaddle(player3.x, player3.y, player3.width, player3.height, player3.color);
        drawBall(ball.x, ball.y, ball.radius, ball.color);
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

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

showPong3();
