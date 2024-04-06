function showPong3() {
    const canvas = document.getElementById('canvasp3');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let wPressed = false;
    let sPressed = false;
    let upArrowPressed = false;
    let downArrowPressed = false;
    let gameOver = false;
    


    const paddleWidth = 10;

    const paddleHeight = 100; 

    const user = {
        x: 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#FFF',
        score: 0
    };

    const player2 = {
        x: canvas.width - paddleWidth - 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#FFF',
        score: 0
    };

    // Dritter Spieler am unteren Rand
    const player3 = {
        x: canvas.width / 2 - paddleWidth / 2,
        y: canvas.height - 20,
        width: paddleHeight,
        height: paddleWidth,
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
                event.preventDefault();
                break;
            case 40: // Down Arrow
                downArrowPressed = true;
                event.preventDefault();
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
                event.preventDefault();
                break;
            case 40: // Down Arrow
                downArrowPressed = false;
                event.preventDefault();
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

        if (player === player3 && (ball.y + ball.radius < player.y)) {
            return false; // Der Ball darf unten durchgehen, wenn er nicht getroffen wird
        }
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

    function handlePaddleBallCollision(player, ball) {
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.1; // Optional: erhöhe die Geschwindigkeit bei jedem Schlägerkontakt
    }

    function newGButton() {
        const button = document.getElementById('newGButton');
        if (button)
        {
          button.style.display = 'block'; // Button anzeigen
        button.addEventListener('click', function() {
            location.reload(); // Die Seite neu laden für ein neues Spiel
        });
      }
    }

    function showGameOverModal(loser) {
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText(`${loser} lost!`, canvas.width / 4, canvas.height / 2);
        
        // Zeige den "Neues Spiel" Button an
        document.getElementById('newGButton').style.display = 'block';
        newGButton();
    }

    function disableControls() {
        document.removeEventListener('keydown', keyDownHandler);
        document.removeEventListener('keyup', keyUpHandler);
        canvas.removeEventListener('mousemove', mouseMoveHandler);
    }
    
    function update() {
        if (gameOver) return;
    
        // Bewegungen der vertikalen Schläger
        if (wPressed && user.y > 0) user.y -= 8;
        else if (sPressed && user.y < canvas.height - user.height) user.y += 8;
        
        if (upArrowPressed && player2.y > 0) player2.y -= 8;
        else if (downArrowPressed && player2.y < canvas.height - player2.height) player2.y += 8;
        
        // Ballbewegungen
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        
        // Überprüfen der Wände
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.velocityY = -ball.velocityY;
        }
        
        // Spieler verliert einen Punkt, wenn er ein Tor kassiert
        if (ball.x - ball.radius < 0) {
            user.score++;
            if(user.score >= 7) {
                gameOver = true;
                showGameOverModal('Player 1');
                disableControls();
            } else {
                resetBall();
            }
        } else if (ball.x + ball.radius > canvas.width) {
            player2.score++;
            if(player2.score >= 7) {
                gameOver = true;
                showGameOverModal('Player 2');
                disableControls();
            } else {
                resetBall();
            }
        }
        
        // Überprüfung für Spieler 3
        if (ball.y + ball.radius >= canvas.height - 10) { // Anpassung, um die Position des dritten Schlägers zu berücksichtigen
            if (ball.x >= player3.x && ball.x <= (player3.x + player3.width)) {
                // Ball prallt ab, wenn er den Schläger trifft
                ball.velocityY = -ball.speed;
            } else {
                // Spieler 3 verliert einen Punkt, wenn er ein Tor kassiert
                player3.score++;
                if(player3.score >= 7) {
                    gameOver = true;
                    showGameOverModal('Player 3');
                    disableControls();
                } else {
                    resetBall();
                }
            }
        }
        
        // Kollisionserkennung für die vertikalen Schläger
        if (collisionDetect(user, ball)) handlePaddleBallCollision(user, ball);
        if (collisionDetect(player2, ball)) handlePaddleBallCollision(player2, ball);
    }
    

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
        ball.velocityY = (Math.random() * 2 - 1) * ball.speed;
        ball.speed = 7;
    }

    function drawScore() {
        // Punkte für Spieler 1
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.fillText(user.score.toString(), 20, 50); // Zeigt nur die Punktzahl an
    
        // Punkte für Spieler 2
        ctx.fillText(player2.score.toString(), canvas.width - 140, 50); // Zeigt nur die Punktzahl an
    
        // Punkte für Spieler 3, falls er aktiv ist
        ctx.fillText(player3.score.toString(), canvas.width / 2 - 70, canvas.height - 20); // Zeigt nur die Punktzahl an
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle(user.x, user.y, user.width, user.height, user.color);
        drawPaddle(player2.x, player2.y, player2.width, player2.height, player2.color);
        // Zeichnet den dritten Schläger
        drawPaddle(player3.x, player3.y, player3.width, player3.height, player3.color);
        drawBall(ball.x, ball.y, ball.radius, ball.color);
        drawScore();
    }

    function drawPaddle(x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height); // Rechteck zeichnen
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
