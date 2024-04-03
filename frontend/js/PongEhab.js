function showPongEhabPage() {
    
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
    
/*         document.addEventListener('keydown', function(event) {
            switch(event.key) {
                case 'w': player1.y -= 20; break;
                case 's': player1.y += 20; break;
                case 'ArrowUp': player2.y -= 20; break;
                case 'ArrowDown': player2.y += 20; break;
            }
        }); */

        document.addEventListener('keydown', function(event) {
            const moveAmount = 30; // Erhöht von 20 auf 30 für schnellere Bewegung
            switch(event.key) {
                case 'w': player1.y -= moveAmount; break;
                case 's': player1.y += moveAmount; break;
                case 'ArrowUp': player2.y -= moveAmount; break;
                case 'ArrowDown': player2.y += moveAmount; break;
            }
            
            // Verhindere, dass die Schläger über den Bildschirm hinaus bewegt werden
            player1.y = Math.max(Math.min(player1.y, canvas.height - player1.height), 0);
            player2.y = Math.max(Math.min(player2.y, canvas.height - player2.height), 0);
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
            console.log("hallo ehab page");      ball.velocityX = -ball.velocityX;
            ball.speed = 7;
        }
    
        function collisionDetection(ball, player) {
            // Kollisionsüberprüfung für den linken und rechten Schläger
            if (ball.x - ball.radius < player1.x + player1.width && ball.x + ball.radius > player1.x &&
                ball.y + ball.radius > player1.y && ball.y - ball.radius < player1.y + player1.height ||
                ball.x - ball.radius < player2.x + player2.width && ball.x + ball.radius > player2.x &&
                ball.y + ball.radius > player2.y && ball.y - ball.radius < player2.y + player2.height) {
                
                // Kollision detektiert, Ballrichtung umkehren
                ball.velocityX = -ball.velocityX * 1.1; // Erhöht zusätzlich die Geschwindigkeit des Balls bei jedem Schlag
                ball.velocityY += 0.1 * (Math.random() > 0.5 ? 1 : -1); // Fügt eine kleine zufällige Y-Verschiebung hinzu
            } else if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
                // Überprüft, ob der Ball einen der horizontalen Ränder ohne Kollision mit den Schlägern erreicht hat
                if (ball.x < canvas.width / 2) player2.score++; // Punkt für Spieler 2
                else player1.score++; // Punkt für Spieler 1
                
                if (player1.score === 7 || player2.score === 7) {
                    gameOver = true;
                    winner = player1.score === 7 ? 'Player 1' : 'Player 2';
                    generateConfetti();
                }
                
                resetBall();
            }
        }
    
        function update() {
            if (!gameOver) {
                ball.x += ball.velocityX;
                console.log("hallo ehab page");          ball.y += ball.velocityY;
    
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
            console.log("hallo ehab page");  }
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
                if (gameOver) requestAnimationFrame(updateConfetti);
            }
    
            updateConfetti();
        }
};