function showPongEhab() {
    const canvas = document.getElementById('canvasehab');
    if (canvas) {
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
  
        document.addEventListener("visibilitychange", function () {
            if (document.visibilityState === 'hidden') {
                isGamePaused = true;
            } else {
                isGamePaused = false;
            }
        });
  
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
                    event.preventDefault();
                    break;
                case 40:
                    downArrowPressed = true;
                    event.preventDefault();
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
                    event.preventDefault();
                    break;
                case 40:
                    downArrowPressed = false;
                    event.preventDefault();
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
  
        function newGamButton() {
          const button = document.getElementById('newGamButton');
          if (button)
          {
            button.style.display = 'block'; 
          button.addEventListener('click', function() {
              location.reload(); 
          });
        }
      }
  
      showStartMessageWithCountdown(5);
  
      function showStartMessageWithCountdown(seconds) {
        if (seconds > 0) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
    
            ctx.fillStyle = "#FFF";
            ctx.font = "20px Arial";
            ctx.textAlign = "left";
    
            ctx.fillText("Player 1", 20, canvas.height / 2 - 10);
            ctx.fillText("Use (W / S)", 20, canvas.height / 2 + 10);
    
            ctx.fillText("Player 2", canvas.width - 100, canvas.height / 2 - 10);
            ctx.fillText("Use (↑ / ↓)", canvas.width - 100, canvas.height / 2 + 10);
    
            ctx.font = "bold 30px Arial";
            ctx.fillText("Whoever scores 7 goals first wins", canvas.width / 2 - 225, canvas.height / 2 - 20);
    
            ctx.font = "bold 30px Arial";
            ctx.fillText("Starting in: " + seconds, canvas.width / 2 - 100, canvas.height / 2 + 50);
    
            setTimeout(function () {
                showStartMessageWithCountdown(seconds - 1);
            }, 1000);
        } else {
            gameLoop();
        }
    }
  
      function showGameOverModal2(winner) {
          ctx.fillStyle = "white";
          ctx.font = "48px Arial";
          ctx.fillText(`${winner} Won!`, canvas.width / 4, canvas.height / 2 );
          
          
          const newGamButton2 = document.getElementById('newGamButton');
          if (newGamButton2)
              document.getElementById('newGamButton').style.display = 'block';
          newGamButton();
      }
  
      function showGameOver() {
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
  
          ctx.fillStyle = "white";
          ctx.font = "48px Arial";
          ctx.textAlign = "center";
          ctx.fillText(gameOverMessage, canvas.width / 2, canvas.height / 2 - 100); 
      
      }
      
      function showGameOverModal(winner) {
          gameOverMessage = `${winner} Won!`;
          showGameOverModal2(winner);
          gameOver = true;
      }
  
      function disableControls() {
          document.removeEventListener('keydown', keyDownHandler);
          document.removeEventListener('keyup', keyUpHandler);
      }
  
        function update() {
            if (gameOver) return;
  
            if (wPressed && player1.y > 0) player1.y -= 8;
            else if (sPressed && player1.y < canvas.height - player1.height) player1.y += 8;
  
            if (upArrowPressed && player2.y > 0) player2.y -= 8;
            else if (downArrowPressed && player2.y < canvas.height - player2.height) player2.y += 8;
  
            ball.x += ball.velocityX;
            ball.y += ball.velocityY;
  
            if (ball.y - ball.radius < 0) {
              ball.velocityY = Math.abs(ball.velocityY);
            } else if (ball.y + ball.radius > canvas.height) {
              ball.velocityY = -Math.abs(ball.velocityY);
            }
  
            if (ball.x - ball.radius < 0) {
                player2.score++;
                if (player2.score >= 7) {
                    gameOver = true;
                    showGameOverModal('Player 2');
                    disableControls();
                } else {
                    resetBall();
                }
            } else if (ball.x + ball.radius > canvas.width) {
                player1.score++;
                if (player1.score >= 7) {
                    gameOver = true;
                    showGameOverModal('Player 1');
                    disableControls();
                } else {
                    resetBall();
                }
            }
  
            if (collisionDetect(player1, ball)) handlePaddleBallCollision(player1, ball);
            if (collisionDetect(player2, ball)) handlePaddleBallCollision(player2, ball);
        }
  
        function resetBall() {
          ball.x = canvas.width / 2;
          ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
          ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
          ball.velocityY = (Math.random() * 2 - 1) * ball.speed;
          ball.speed = 7;
        }
  
        function drawScore() {
            ctx.fillStyle = "white";
            ctx.font = "32px Arial";
            ctx.fillText(player1.score.toString(), 20, 50);
            ctx.fillText(player2.score.toString(), canvas.width - 140, 50);
        }
  
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPaddle(player1.x, player1.y, player1.width, player1.height, player1.color);
            drawPaddle(player2.x, player2.y, player2.width, player2.height, player2.color);
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
  
        function gameLoop() {
            if (!isGamePaused && !gameOver) {
                update();
                draw();
            }
            requestAnimationFrame(gameLoop);
        }
    }
  }