function showPongEhab() {
    const canvas = document.getElementById('canvasehab');
    const ctx = canvas.getContext('2d');

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

    const player2 = {
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

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    function keyDownHandler(event) {
      event.preventDefault();
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
          break;
        case 40: 
          downArrowPressed = false;
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

      return ball.left < player.right && ball.top < player.bottom && ball.right > player.left && ball.bottom > player.top;
    }

    function showNewGameButton() {
        const button = document.getElementById('newGameButton');
        if (button)
        {
          button.style.display = 'block'; 
        button.addEventListener('click', function() {
            location.reload(); 
        });
      }
    }
    

    function checkGameOver() {
        if (user.score === 7 || player2.score === 7) {
            gameOver = true;
            let winner = user.score === 7 ? "Spieler 1 gewinnt!" : "Spieler 2 gewinnt!";
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.fillText(winner, canvas.width / 4, canvas.height / 2);
    
            
            showNewGameButton();
          
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

        if (upArrowPressed && player2.y > 0) {
          player2.y -= 8;
        } else if (downArrowPressed && (player2.y < canvas.height - player2.height)) {
          player2.y += 8;
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
          player2.score += 1;
            reset();
        }

        
        let player = (ball.x < canvas.width / 2) ? user : player2;
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

function checkGameOver() {
    if (user.score === 7 || player2.score === 7) {
        gameOver = true;
        ctx.fillStyle = '#FFF';
        ctx.font = '48px Arial';
        let winner = user.score === 7 ? "Spieler 1 gewinnt!" : "Spieler 2 gewinnt!";
        ctx.fillText(winner, (canvas.width / 4), (canvas.height / 2));

        
        showNewGameButton();
      
    }
}

function showNewGameButton() {
    const button = document.getElementById('newGameButton');
    button.style.display = 'block'; 
}

function reset() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}




document.getElementById('newGameButton').addEventListener('click', function() {
    location.reload(); 
});


function gameLoop() {
    if (!gameOver) {
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
      drawScore(3 * canvas.width / 4, canvas.height / 6, player2.score);
      drawPaddle(user.x, user.y, user.width, user.height, user.color);
      drawPaddle(player2.x, player2.y, player2.width, player2.height, player2.color);
      drawBall(ball.x, ball.y, ball.radius, ball.color);
    }

    function gameLoop() {
      update();
      render();
    }

    setInterval(gameLoop, 1000 / 60);
    function showNewGameButton() {
        const button = document.getElementById('newGameButton');
        if (button)
        {
        button.style.display = 'block'; 
        button.addEventListener('click', function() {
            location.reload(); 
        });
      }
    }
    
}
