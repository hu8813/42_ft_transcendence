function showPongEhabPage(){
console.log("pong ehab page");
const canvas = document.getElementById('pongEhabGameCanvas'); // Aktualisierte ID
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

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

function drawBall() {
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();
}

function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

function collisionDetection(ball, player) {
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        if (ball.y > player.y && ball.y < player.y + player.height) {
            ball.velocityX = -ball.velocityX;
        } else {
            if (ball.x - ball.radius < 0) player2.score++;
            else player1.score++;
            
            if (player1.score === 7 || player2.score === 7) {
                gameOver = true;
                winner = player1.score === 7 ? 'Player 1' : 'Player 2';
                generateConfetti();
            }

            resetBall();
        }
    }
}

function update() {
    if (!gameOver) {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.velocityY = -ball.velocityY;
        }

        collisionDetection(ball, player1);
        collisionDetection(ball, player2);
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPlayer(player1);
    drawPlayer(player2);
}

/* function gameLoop() {
    update();
    render();
    if (!gameOver) requestAnimationFrame(gameLoop);
} */

function gameLoop() {
    if (!gameOver) {
        update();
        render();
        requestAnimationFrame(gameLoop);
    } else {
        showGameOverModal();
    }
}
function showGameOverModal() {
    const gameOverModal = document.getElementById('pongEhabGameOverModal');
    gameOverModal.classList.remove('pongEhab-hidden');
    const winnerText = document.getElementById('pongEhabWinnerText');
    winnerText.textContent = winner;
}

gameLoop();

// Konfetti-Effekt
function generateConfetti() {
    const confettiCount = 100;
    const confetti = [];
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            width: 5,
            height: 10,
            color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
            speed: 1 + Math.random() * 3,
        });
    }

    function drawConfetti() {
        confetti.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, particle.width, particle.height);
            particle.y += particle.speed;
            if (particle.y > canvas.height) {
                particle.y = 0;
                particle.x = Math.random() * canvas.width;
            }
        });
    }

    function updateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawConfetti();
        if (gameOver) {
            requestAnimationFrame(updateConfetti);
        //window.location.href ="/#play!" ;
        }
    }

    updateConfetti();
}
};