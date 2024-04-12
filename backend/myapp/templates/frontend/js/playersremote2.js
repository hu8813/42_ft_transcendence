function showPlayersRemote2() {
    
    const loadCanvas = new Promise((resolve, reject) => {

        const canvas = document.getElementById('canvasremote2');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            resolve(ctx);

            const userLogin = localStorage.getItem('userLogin');

            if (userLogin) {
                
                fetch(`${getBackendURL()}/check-player-waiting/${userLogin}/`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.waiting) {
                            
                            startGame(ctx);
                        } else {
                            
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

            function sendPlayerInput(input) {
                fetch(`${getBackendURL()}/update-player/`, {
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
                fetch(`${getBackendURL()}/game-state/`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch game state');
                        }
                        return response.json();
                    })
                    .then(gameState => {
                        
                        
                    })
                    .catch(error => {
                        console.error('Error fetching game state:', error);
                        
                        gameOver = true; 
                    });
            }
            

            const netWidth = 4;
            const netHeight = canvas.height;

            const paddleWidth = 10;
            const paddleHeight = 50; 

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

                    
                    showNewGameButtonRemote2();

                }
            }

            let gameOver = false; 

            
            function update() {
                if (!gameOver) {
                    
                    if (wPressed && user.y > 0) {
                        user.y -= 8;
                    } else if (sPressed && (user.y < canvas.height - user.height)) {
                        user.y += 8;
                    }

                    
                    if (upArrowPressed && ai.y > 0) {
                        ai.y -= 8;
                    } else if (downArrowPressed && (ai.y < canvas.height - ai.height)) {
                        ai.y += 8;
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
                    updateGameFromServer();
                    update();
                    render(); 
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
                button.style.display = 'block'; 
            }

            
            document.getElementById('newGameButtonremote2').addEventListener('click', function() {
                location.reload(); 
            });

        } else {
            reject(new Error('Canvas element not found'));
        }

    });
}
