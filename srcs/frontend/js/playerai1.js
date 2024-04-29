function showPlayerAi1Page() {
    const canvas = document.getElementById('playerAiCanvas');
    if (canvas)
    {
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;

        let wPressed = false;
        let sPressed = false;
        let gameOver = false;
        let isGamePaused = false;

        const paddleWidth = 10;
        const paddleHeight = 100;

        const player1 = {
            x: 10,
            y: canvas.height / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            color: '#FFF',
            score: 0
        };

        const CPU = {
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

        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);

        document.addEventListener("visibilitychange", function() {
            if (document.visibilityState === 'hidden') {
                isGamePaused = true;
            } else {
                isGamePaused = false;
            }
        });

        function keyDownHandler(event) {
            switch(event.keyCode) {
                case 87:
                    wPressed = true;
                    break;
                case 83:
                    sPressed = true;
                    break;
            }
        }

        function keyUpHandler(event) {
            switch(event.keyCode) {
                case 87:
                    wPressed = false;
                    break;
                case 83:
                    sPressed = false;
                    break;
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

        function handlePaddleBallCollision(player, ball) {
            let collidePoint = ball.y - (player.y + player.height / 2);
            collidePoint = collidePoint / (player.height / 2);
            let angleRad = (Math.PI / 4) * collidePoint;
            let direction = (ball.x < canvas.width / 2) ? 1 : -1;
            ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityY = ball.speed * Math.sin(angleRad);
            ball.speed += 0.1;
        }

        showStartMessageWithCountdown(5);

        async function showStartMessageWithCountdown(seconds) {
            if(seconds > 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; 
                ctx.fillRect(0, 0, canvas.width, canvas.height);
    
                ctx.fillStyle = "#FFF"; 
                ctx.font = "30px Arial";
                ctx.textAlign = "center";
                let scoregoals = await translateKey("scoregoals");
                ctx.fillText(scoregoals, canvas.width / 2, canvas.height / 2 - 120);
                
                ctx.font = "bold 50px Arial";
                ctx.fillText(seconds, canvas.width / 2, canvas.height / 2 + 5);
                
                ctx.font = "25px Arial";
                let leftside = await translateKey("leftside");
                ctx.fillText(leftside, canvas.width / 2, canvas.height / 2 + 80);
                
                ctx.font = "25px Arial";
                let moving = await translateKey("moving");
                ctx.fillText(moving, canvas.width / 2, canvas.height / 2 + 130);        

                setTimeout(function() {
                showStartMessageWithCountdown(seconds - 1);
                }, 1000);
            } else {
                
                gameLoop();
            }
        }

        async function showGameOverModal2(winner) {
            ctx.fillStyle = "white";
            ctx.font = "48px Arial";
            let won = await translateKey("won");
            let anywhere = await translateKey("anywhere");
            ctx.fillText(`${winner} ` + won, canvas.width / 2, canvas.height / 2 - 50);
        
            ctx.font = "24px Arial";
            ctx.fillText(anywhere, canvas.width / 2, canvas.height / 2 + 50);
        
            canvas.addEventListener('click', function handleClick() {
                location.reload();
                canvas.removeEventListener('click', handleClick);
            }, { once: true }); 
        }
        
        if (gameOver) {
            canvas.addEventListener('click', function handleClick() {
                location.reload();
                canvas.removeEventListener('click', handleClick);
            }, { once: true });
        }
        
        
        let gameOverMessage = '';

        function showGameOver() {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "white";
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.fillText(gameOverMessage, canvas.width / 2, canvas.height / 2 - 100); 
        
        }
        
        function showGameOverModal(winner) {
            gameOverMessage = `${winner} won!`;
            showGameOverModal2(winner);
            gameOver = true;
        }
        
        function resetGame() {
            player1.y = canvas.height / 2 - paddleHeight / 2;
            CPU.y = canvas.height / 2 - paddleHeight / 2;        
            resetBall();
        }
         
        async function update() {
            if (gameOver || isGamePaused) return;

            const paddleSpeed = 8;
            const cpuReactionBuffer = 40;

            if (wPressed && player1.y > 0) player1.y -= paddleSpeed;
            if (sPressed && (player1.y + player1.height) < canvas.height) player1.y += paddleSpeed;

            if (Math.abs(ball.y - (CPU.y + CPU.height / 2)) > cpuReactionBuffer) {
                let cpuDirection = ball.y < CPU.y + CPU.height / 2 ? -1 : 1;
                CPU.y += cpuDirection * paddleSpeed;
            }
            CPU.y = Math.max(Math.min(CPU.y, canvas.height - CPU.height), 0);

            ball.x += ball.velocityX;
            ball.y += ball.velocityY;
        
            if (ball.y - ball.radius < 0) {
                ball.velocityY = Math.abs(ball.velocityY);
            } else if (ball.y + ball.radius > canvas.height) {
                ball.velocityY = -Math.abs(ball.velocityY);
            }
        
            if (ball.x - ball.radius < 0) {
                CPU.score++;
                if (CPU.score === 7) {
                    gameOver = true;
                    const jwtToken = localStorage.getItem('jwtToken');
                    const csrfToken = await getCSRFCookie(); 
                    try {
                    const response = await fetch(`/api/update-score?result=lost&gametype=pong&oppononent=cpu`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        },
                    });
                    if (response.ok) {
                        await fetchLeaderboardData();
                    } else {
                        console.error('Failed to update user score');
                    }
                    } catch (error) {
                    console.error('Failed to update user score:', error);
                    }
                    showGameOverModal('CPU');
                } else {
                    resetGame();
                }
            } else if (ball.x + ball.radius > canvas.width) {
                player1.score++;
                if (player1.score === 7) {
                    gameOver = true;
                    const jwtToken = localStorage.getItem('jwtToken');
                    const csrfToken = await getCSRFCookie(); 
                    try {
                    const response = await fetch(`/api/update-score?result=win&gametype=pong&oppononent=cpu`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        },
                    });
                    if (response.ok) {
                        await fetchLeaderboardData();
                    } else {
                        console.error('Failed to update user score');
                    }
                    } catch (error) {
                    console.error('Failed to update user score:', error);
                    }
                    showGameOverModal('player1');
                } else {
                    resetGame();
                }
            }
        
            if (collisionDetect(player1, ball)) {
                handlePaddleBallCollision(player1, ball);
            }
            if (collisionDetect(CPU, ball)) {
                handlePaddleBallCollision(CPU, ball);
            }
        }

        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
            ball.velocityY = (Math.random() * 2 - 1) * ball.speed;
            ball.speed = 7;
        } 

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPaddle(player1.x, player1.y, player1.width, player1.height, player1.color);
            drawPaddle(CPU.x, CPU.y, CPU.width, CPU.height, CPU.color);
            drawBall(ball.x, ball.y, ball.radius, ball.color);
            drawScore();
            if (gameOver) {
                showGameOver(); 
            }
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
            ctx.font = '32px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(player1.score.toString(), 50, 50);
            ctx.fillText(CPU.score.toString(), canvas.width - 100, 50);
        }

        function gameLoop() {
            if (!isGamePaused && !gameOver) {
                update();
                draw();
            }
            requestAnimationFrame(gameLoop);
        }
    }
}
