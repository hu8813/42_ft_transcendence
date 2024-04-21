
/*function startTournament(playerCount) {
    const players = [];
    for (let i = 1; i <= playerCount; i++) {
        players.push(i);
    }
    shuffleArray(players);
    showTournament(players);
}


function letsStart() {
    //const playerCount = prompt("How many players will there be in the tournament? Enter 4 or 8:", "4");
    const validCounts = ["4", "8"];
    playerCount = "4";
    if (validCounts.includes(playerCount)) {
        startTournament(parseInt(playerCount, 10));
    } else {
        alert("Invalid number of players. Please refresh and enter either 4 or 8.");
    }

}*/

function showTournament() {

    const canvas = document.getElementById('canvastour');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const players = [1, 2, 3, 4];
    shuffleArray(players);

    let currentMatch = 0;
    let winners = [];
    
    letsStart();
    function nextMatch() {
        if (currentMatch >= 2) {
            console.log(`Final Match: Player ${winners[0]} vs Player ${winners[1]}`);
            showPongTour(winners[0], winners[1], true, handleWinner);
        } else {
            let matchPlayers = [players[currentMatch * 2], players[currentMatch * 2 + 1]];
            console.log(`Match ${currentMatch + 1}: Player ${matchPlayers[0]} vs Player ${matchPlayers[1]}`);
            showPongTour(matchPlayers[0], matchPlayers[1], false, handleWinner);
        }
    }

    function handleWinner(winner) {
        winners.push(winner);
        currentMatch++;
        if (currentMatch < 2 || (currentMatch === 2 && winners.length === 2)) {
            nextMatch();
        } else {
            console.log(`The winner of the tournament is Player ${winner}! Congratulations!`);
        }
    }

    console.log("Tournament starts now. Here is the schedule:");
    console.log(`Match 1: Player ${players[0]} vs Player ${players[1]}`);
    console.log(`Match 2: Player ${players[2]} vs Player ${players[3]}`);

    nextMatch();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showPongTour(player1Id, player2Id, isFinal, handleWinner) {
    const canvas = document.getElementById('canvastour');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let wPressed = false;
    let sPressed = false;
    let upArrowPressed = false;
    let downArrowPressed = false;
    let gameOver = false;
    let isGamePaused = false;

    const paddleWidth = 10;
    const paddleHeight = 100;

    const player1 = {
        id: player1Id,
        x: 10,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#FFF',
        score: 0
    };

    const player2 = {
        id: player2Id,
        x: canvas.width - paddleWidth - 10,
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
        color: '#FFF'
    };

    function resetGame() {
        player1.score = 0;
        player2.score = 0;
        resetBall();
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
        ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
        ball.velocityY = (Math.random() * 2 - 1) * ball.speed;
        ball.speed = 7;
    }

    function gameLoop() {
        if (!isGamePaused && !gameOver) {
            update();
            draw();
        }
        requestAnimationFrame(gameLoop);
    }

    function initControls() {
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
    }

    function removeControls() {
        document.removeEventListener('keydown', keyDownHandler);
        document.removeEventListener('keyup', keyUpHandler);
    }

    initControls();

    function keyDownHandler(event) {
        switch (event.keyCode) {
            case 87:
                wPressed = true;
                break;
            case 83:
                sPressed = true;
                break;
            case 38:
                upArrowPressed = true;
                break;
            case 40:
                downArrowPressed = true;
                break;
        }
    }

    function keyUpHandler(event) {
        switch (event.keyCode) {
            case 87:
                wPressed = false;
                break;
            case 83:
                sPressed = false;
                break;
            case 38:
                upArrowPressed = false;
                //event.preventDefault();
                break;
            case 40:
                downArrowPressed = false;
                //event.preventDefault();
                break;
        }
    }

    function update() {
        if (gameOver) return;

        if (wPressed && player1.y > 0) player1.y -= 8;
        if (sPressed && player1.y < canvas.height - player1.height) player1.y += 8;
        if (upArrowPressed && player2.y > 0) player2.y -= 8;
        if (downArrowPressed && player2.y < canvas.height - player2.height) player2.y += 8;

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.velocityY = -ball.velocityY;
        }

        if (ball.x - ball.radius < 0) {
            player2.score++;
            checkGameOver();
        } else if (ball.x + ball.radius > canvas.width) {
            player1.score++;
            checkGameOver();
        }

        if (collisionDetect(player1, ball)) handlePaddleBallCollision(player1, ball);
        if (collisionDetect(player2, ball)) handlePaddleBallCollision(player2, ball);
    }

    function checkGameOver() {
        if (player1.score >= 7 || player2.score >= 7) {
            gameOver = true;
            showGameOverModal(player1.score > player2.score ? player1.id : player2.id);
            removeControls();
        } else {
            resetBall();
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

        return ball.right > player.left && ball.top < player.bottom && ball.left < player.right && ball.bottom > player.top;
    }

    function handlePaddleBallCollision(player, ball) {
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        ball.speed += 0.1;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle(player1.x, player1.y, player1.width, player1.height, player1.color);
        drawPaddle(player2.x, player2.y, player2.width, player2.height, player2.color);
        drawBall(ball.x, ball.y, ball.radius, ball.color);
        drawScore();
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
        ctx.fillStyle = "#FFF";
        ctx.font = "32px Arial";
        ctx.fillText(`${player1.id} Score: ${player1.score}`, 20, 50);
        ctx.fillText(`${player2.id} Score: ${player2.score}`, canvas.width - 200, 50);
    }

    function showGameOverModal(winner) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Player ${winner} won the match!`, canvas.width / 2, canvas.height / 2);
        setTimeout(() => {
            handleWinner(winner);
        }, 3000);
    }

    gameLoop();
}

document.addEventListener('DOMContentLoaded', () => {
    showTournament();
});
