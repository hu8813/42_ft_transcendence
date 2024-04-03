function showPlayersRemote2() {
    const backendURL = 'http://localhost:8000'; // Replace this with your actual backend URL

    const loadCanvas = new Promise((resolve, reject) => {

        const canvas = document.getElementById('canvasremote2');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            resolve(ctx);

            const userLogin = localStorage.getItem('userLogin');

            if (userLogin) {
                // Send user login to server to check if another player is waiting
                fetch(`${backendURL}/check-player-waiting/${userLogin}/`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.waiting) {
                            // Another player is waiting, start the game
                            startGame(ctx);
                        } else {
                            // Display a message indicating waiting for the second player to join
                            displayWaitingMessage();
                        }
                    })
                    .catch(error => {
                        console.error('Error checking player waiting status:', error);
                    });
            } else {
                console.error('User login not found in local storage');
            }

            function displayWaitingMessage() {
                const messageContainer = document.getElementById('waitingMessageContainer');
                if (messageContainer) {
                    messageContainer.innerText = 'Waiting for the second player to join...';
                }
            }

            function startGame(ctx) {
                // Here you can initialize any game-related logic
                console.log('Starting the game...');

                // Optionally, you can clear any previous messages or UI elements indicating waiting
                clearWaitingMessage();

                // Start the game loop
                gameLoop();

                // Optionally, you can initialize any game state or setup here
            }

            function clearWaitingMessage() {
                const messageContainer = document.getElementById('waitingMessageContainer');
                if (messageContainer) {
                    messageContainer.innerText = ''; // Clear the waiting message
                }
            }

            function sendPlayerInput(input) {
                fetch(`${backendURL}/update-player/`, {
                    method: 'POST',
                    body: JSON.stringify({ input }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to send player input to server');
                    }
                })
                .catch(error => {
                    console.error('Error sending player input:', error);
                });
            }

            function updateGameFromServer() {
                fetch(`${backendURL}/game-state/`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch game state');
                        }
                        return response.json();
                    })
                    .then(gameState => {
                        // Update the game based on the received game state
                        // For example, update the positions of remote players
                    })
                    .catch(error => {
                        console.error('Error fetching game state:', error);
                        // Handle the error by stopping the game loop or taking appropriate action
                        gameOver = true; // Stop the game loop
                    });
            }
            

            const netWidth = 4;
            const netHeight = canvas.height;

            const paddleWidth = 10;
            const paddleHeight = 50; // Reduzierte Schlägerhöhe

            let upArrowPressed = false;
            let downArrowPressed = false;
            let wPressed = false;
            let sPressed = false;

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

            window.addEventListener('keydown', event => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    sendPlayerInput(event.key);
                }

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

                    // Button anzeigen
                    showNewGameButtonRemote2();

                }
            }

            let gameOver = false; // Globale Variable, um den Spielstatus zu verfolgen

            // Update-Funktion, um Dinge zu aktualisieren
            function update() {
                if (!gameOver) {
                    // Bewegung der Spieler
                    if (wPressed && user.y > 0) {
                        user.y -= 8;
                    } else if (sPressed && (user.y < canvas.height - user.height)) {
                        user.y += 8;
                    }

                    // Adjust user paddle position based on arrow key events
                    if (upArrowPressed && ai.y > 0) {
                        ai.y -= 8;
                    } else if (downArrowPressed && (ai.y < canvas.height - ai.height)) {
                        ai.y += 8;
                    }

                    // Bewegung des Balls
                    ball.x += ball.velocityX;
                    ball.y += ball.velocityY;

                    // Überprüfung, ob der Ball die oberen oder unteren Wände trifft
                    if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
                        ball.velocityY = -ball.velocityY;
                    }

                    // Punktzahl und Reset, wenn der Ball die linke oder rechte Wand trifft
                    if (ball.x + ball.radius >= canvas.width) {
                        user.score += 1;
                        reset();
                    } else if (ball.x - ball.radius <= 0) {
                        ai.score += 1;
                        reset();
                    }

                    // Kollisionsdetektion mit den Schlägern
                    let player = (ball.x < canvas.width / 2) ? user : ai;
                    if (collisionDetect(player, ball)) {
                        // Ballrichtung ändern
                        let angle = 0;
                        if (ball.y < (player.y + player.height / 2)) {
                            angle = -1 * Math.PI / 4;
                        } else if (ball.y > (player.y + player.height / 2)) {
                            angle = Math.PI / 4;
                        }
                        ball.velocityX = (player === user ? 1 : -1) * ball.speed * Math.cos(angle);
                        ball.velocityY = ball.speed * Math.sin(angle);

                        ball.speed += 0.1; // Erhöhe die Geschwindigkeit des Balls, um das Spiel herausfordernder zu machen
                    }

                    // Überprüfe, ob das Spiel vorbei ist
                    checkGameOver();
                }
            }

            function reset() {
                ball.x = canvas.width / 2;
                ball.y = canvas.height / 2;
                ball.velocityX = -ball.velocityX;
                ball.speed = 7;
            }

            // Diese Funktion wird am Anfang einmal aufgerufen, um das Spiel zu starten
            function gameLoop() {
                if (!gameOver) {
                    updateGameFromServer();
                    update();
                    render(); // Stelle sicher, dass du eine Funktion hast, die alles neu zeichnet
                }
                requestAnimationFrame(gameLoop);
            }

            requestAnimationFrame(gameLoop);


            function render() {
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
                button.style.display = 'block'; // Button anzeigen
            }

            // Event listener for the "New Game" button
            document.getElementById('newGameButtonremote2').addEventListener('click', function() {
                location.reload(); // Die Seite neu laden für ein neues Spiel
            });

        } else {
            reject(new Error('Canvas element not found'));
        }

    });
}
