function showPongGamePage(){
    console.log("pong game page");
    const canvas = document.getElementById('pongGameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800; // Festgelegte Breite für das Canvas
    canvas.height = 400; // Festgelegte Höhe für das Canvas

    let gameOver = false;
    let winner = '';

    let ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        velocityX: 5,
        velocityY: 5,
        speed: 7,
        color: "#FFF"
    };

    let player1 = {
        x: 0,
        y: (canvas.height - 100) / 2,
        width: 10,
        height: 100,
        score: 0,
        color: "#FFF"
    };

    let player2 = {
        x: canvas.width - 10,
        y: (canvas.height - 100) / 2,
        width: 10,
        height: 100,
        score: 0,
        color: "#FFF"
    };

    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'w': player1.y -= 20; break;
            case 's': player1.y += 20; break;
            case 'ArrowUp': player2.y -= 20; break;
            case 'ArrowDown': player2.y += 20; break;
        }
    });

    function drawRect(x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }

    function drawCircle(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fill();
    }

    function drawText(text, x, y, color = '#FFF') {
        ctx.fillStyle = color;
        ctx.font = '50px Arial';
        ctx.fillText(text, x, y);
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = -ball.velocityX;
        ball.speed = 7;
    }

    function collisionDetection(b, p) {
        b.top = b.y - b.radius;
        b.bottom = b.y + b.radius;
        b.left = b.x - b.radius;
        b.right = b.x + b.radius;

        p.top = p.y;
        p.bottom = p.y + p.height;
        p.left = p.x;
        p.right = p.x + p.width;

        return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
    }

    function update() {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.velocityY = -ball.velocityY;
        }

        let player = (ball.x < canvas.width / 2) ? player1 : player2;

        if(collisionDetection(ball, player)) {
            ball.velocityX = -ball.velocityX;
        }

        if(ball.x - ball.radius < 0) {
            player2.score++;
            resetBall();
        } else if(ball.x + ball.radius > canvas.width) {
            player1.score++;
            resetBall();
        }

        if(player1.score === 7 || player2.score === 7) {
            gameOver = true;
            winner = player1.score === 7 ? 'Player 1' : 'Player 2';
        }
    }

    function render() {
        // Hintergrund
        drawRect(0, 0, canvas.width, canvas.height, '#000');

        // Mittellinie
        drawRect(canvas.width/2 - 2, 0, 4, canvas.height, '#FFF');

        // Ball zeichnen
        drawCircle(ball.x, ball.y, ball.radius, ball.color);

        // Spieler zeichnen
        drawRect(player1.x, player1.y, player1.width, player1.height, player1.color);
        drawRect(player2.x, player2.y, player2.width, player2.height, player2.color);

        // Punktestand
        drawText(player1.score, canvas.width / 4, 50);
        drawText(player2.score, 3 * canvas.width / 4, 50);
    }

    function gameLoop() {
        if(!gameOver) {
            update();
            render();
            requestAnimationFrame(gameLoop);
        } else {
            showGameOverModal();
        }
    }

    function showGameOverModal() {
        const gameOverModal = document.querySelector('.game-over-modal');
        gameOverModal.style.display = 'block'; // Zeige das Modal
        const winnerName = document.getElementById('winner-name');
        winnerName.textContent = winner; // Setze den Gewinner-Namen
    }
    /* 
    function showGameOverModal() {
    const gameOverModal = document.getElementById('pongGameOverModal'); // Verwende die eindeutige ID
    gameOverModal.classList.remove('hidden'); // Zeige das Modal
    const winnerName = document.getElementById('pongWinnerName'); // Verwende die eindeutige ID
    winnerName.textContent = winner; // Setze den Gewinner-Namen
}
    */
    

    gameLoop();
    };