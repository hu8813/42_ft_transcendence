function showPongEhab() {
    const canvas = document.getElementById('canvasehab');
    const ctx = canvas.getContext('2d');

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
        case 87: // W
          wPressed = true;
          break;
        case 83: // S
          sPressed = true;
          break;
        case 38: // Pfeil nach oben
          
          upArrowPressed = true;
          break;
        case 40: // Pfeil nach unten
          downArrowPressed = true;
          break;
      }
    }

    function keyUpHandler(event) {
      switch (event.keyCode) {
        case 87: // W
          wPressed = false;
          break;
        case 83: // S
          sPressed = false;
          break;
        case 38: // Pfeil nach oben
          upArrowPressed = false;
          break;
        case 40: // Pfeil nach unten
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
          button.style.display = 'block'; // Button anzeigen
        button.addEventListener('click', function() {
            location.reload(); // Die Seite neu laden für ein neues Spiel
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
    
            // Button anzeigen
            showNewGameButton();
          
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

        if (upArrowPressed && player2.y > 0) {
          player2.y -= 8;
        } else if (downArrowPressed && (player2.y < canvas.height - player2.height)) {
          player2.y += 8;
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
          player2.score += 1;
            reset();
        }

        // Kollisionsdetektion mit den Schlägern
        let player = (ball.x < canvas.width / 2) ? user : player2;
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

function checkGameOver() {
    if (user.score === 7 || player2.score === 7) {
        gameOver = true;
        ctx.fillStyle = '#FFF';
        ctx.font = '48px Arial';
        let winner = user.score === 7 ? "Spieler 1 gewinnt!" : "Spieler 2 gewinnt!";
        ctx.fillText(winner, (canvas.width / 4), (canvas.height / 2));

        // Zeige den "New Game" Button
        showNewGameButton();
      
    }
}

function showNewGameButton() {
    const button = document.getElementById('newGameButton');
    button.style.display = 'block'; // Button anzeigen
}

function reset() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

// Stelle sicher, dass du den "New Game" Button im HTML hast
// <button id="newGameButton" style="display:none;">New Game</button>
// und füge dem Button im JavaScript EventListener hinzu, wie im vorherigen Schritt beschrieben
document.getElementById('newGameButton').addEventListener('click', function() {
    location.reload(); // Die Seite neu laden für ein neues Spiel
});

// Diese Funktion wird am Anfang einmal aufgerufen, um das Spiel zu starten
function gameLoop() {
    if (!gameOver) {
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
        button.style.display = 'block'; // Button anzeigen
        button.addEventListener('click', function() {
            location.reload(); // Die Seite neu laden für ein neues Spiel
        });
      }
    }
    
}
