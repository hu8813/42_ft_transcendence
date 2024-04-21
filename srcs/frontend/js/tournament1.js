let players = [];
let matches = [];
let currentMatchIndex = 0;

let paddle1, paddle2;


class Player {
    constructor(name) {
        this.name = name;
        this.score = 0;
    }
}


let player1 = new Player("Player 1 Name");
let player2 = new Player("Player 2 Name");
players.push(player1, player2);

function startMatch(match) {
    console.log(`Starting match: ${match[0].name} vs ${match[1].name}`);
    showPongTour(match[0], match[1]);
}
   
let ctx;

window.onload = function() {
    console.log('Window geladen')
    setupCanvas();
    var nextMatchButton = document.getElementById('nextMatchButton');
    if (nextMatchButton) {
        nextMatchButton.onclick = startNextMatch;
    } else {
        console.log('nextMatchButton nicht gefunden.');
    }
};

function setupCanvas() {
    const canvas = document.getElementById('canvastour');
    if (canvas) {
        ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        console.log("Canvas-Element gefunden.");
    }
}

function drawPairings() {
    if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    matches.forEach((match, index) => {
        ctx.fillText(`Match ${index + 1}: ${match[0].name} vs ${match[1].name}`, 10, 30 + index * 30);
    });
    }
}

function createPairings() {
    matches = [];
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledPlayers.length; i += 2) {
        if (shuffledPlayers[i + 1]) {
            matches.push([shuffledPlayers[i], shuffledPlayers[i + 1]]);
        }
    }
    drawPairings();
    if (matches.length) startMatch(matches[0]);
}

function advanceTournament() {
    players = players.filter(player => player.score > 0);
    if (players.length === 1) {
        alert(`${players[0].name} is the tournament winner!`);
    } else {
        players.forEach(player => player.score = 0);
        createPairings();
    }
}

function tournamentMatchFinished(winnerName) {
    console.log(`Winner reported: ${winnerName}`);
    const winner = players.find(player => player.name === winnerName);
    if (!winner) {
        console.error(`Winner not found: ${winnerName}`);
        return;
    }

    winner.score++;
    console.log(`Updated score for ${trimmedWinnerName}: ${winner.score}`);
    
    if (currentMatchIndex < matches.length - 1) {
        currentMatchIndex++;
        showPongTour(matches[currentMatchIndex][0], matches[currentMatchIndex][1]);
    } else {
        advanceTournament();
    }
}


function handleNextMatchClick() {
    if (currentMatchIndex >= matches.length - 1) {
        showTournamentWinner();
    } else {
        currentMatchIndex++;
        startMatch(matches[currentMatchIndex]);
    }
}

function startNextMatch() {
    currentMatchIndex++;
    if (currentMatchIndex < matches.length) {
        startMatch(matches[currentMatchIndex]);
    } else {
        alert(`${players[0].name} is the tournament winner!`);
    }
}

function showTournamentWinner() {
    const tournamentWinner = players.reduce((highest, player) => player.score > highest.score ? player : highest, players[0]);
    alert(`${tournamentWinner.name} is the tournament winner!`);
}

function showPongTour(p1, p2) {
    const canvas = document.getElementById('canvastour');
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


        resetGame();
  
        paddle1 = {
            x: 10,
            y: canvas.height / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            color: '#FFF',
            score: 0
        };
  
        paddle2 = {
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
  
        document.getElementById('nextMatchButton').style.visibility = 'hidden';
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

        function showGameOverModal(winner) {
            let gameOverMessage = `${winner.name} won the match!`;
            alert(gameOverMessage);
            tournamentMatchFinished(winner.name);

            if (currentMatchIndex < matches.length - 1) {
                document.getElementById('nextMatchButton').style.visibility = 'visible';
              } else if (players.length > 1) {
                advanceTournament();
              } else {
                alert(`${players[0].name} is the tournament winner!`);
              }
        }

        function showGameOver(gameOverMessage) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
    
            ctx.fillStyle = "white";
            ctx.font = "48px Arial";
            ctx.textAlign = "center";
            ctx.fillText(gameOverMessage, canvas.width / 2, canvas.height / 2 - 100); 
        
        }


        function disableControls() {
            document.removeEventListener('keydown', keyDownHandler);
            document.removeEventListener('keyup', keyUpHandler);
        }
        
        function update() {
            if (gameOver) return;

            if (wPressed && paddle1.y > 0) paddle1.y -= 8;
            else if (sPressed && paddle1.y < canvas.height - paddle1.height) paddle1.y += 8;

            if (upArrowPressed && paddle2.y > 0) paddle2.y -= 8;
            else if (downArrowPressed && paddle2.y < canvas.height - paddle2.height) paddle2.y += 8;

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
                    if (player1.score > player2.score) {
                        showGameOverModal(player1);
                    } else {
                        showGameOverModal(player2);
                    }
                    disableControls();
                } else {
                    resetBall();
                }
            } else if (ball.x + ball.radius > canvas.width) {
                player1.score++;
                if (player1.score >= 7) {
                    gameOver = true;
                    if (player1.score > player2.score) {
                        showGameOverModal(player1);
                    } else {
                        showGameOverModal(player2);
                    }
                    disableControls();
                } else {
                    resetBall();
                }
            }

            if (collisionDetect(paddle1, ball)) handlePaddleBallCollision(paddle1, ball);
            if (collisionDetect(paddle2, ball)) handlePaddleBallCollision(paddle2, ball);
        }

        function resetGame() {
            if (gameOver) {
                gameOver = false;
                paddle1.score = 0;
                paddle2.score = 0;
                resetBall();
            }
        }
    
        /* function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = Math.random() * (canvas.height - ball.radius * 2) + ball.radius;
        ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
        ball.velocityY = (Math.random() * 2 - 1) * ball.speed;
        ball.speed = 7;
        } */
        function resetBall() {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.velocityX = 5 * (Math.random() > 0.5 ? 1 : -1);
            ball.velocityY = 5 * (Math.random() * 2 - 1);
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
              drawPaddle(paddle1.x, paddle1.y, paddle1.width, paddle1.height, paddle1.color);
              drawPaddle(paddle2.x, paddle2.y, paddle2.width, paddle2.height, paddle2.color);
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
            if (gameOver) {
                disableControls();
                let winner;
                if (p1.score > p2.score)
                    winner = p1;
                else
                    winner = p2;
                
                if(winner && typeof winner.name === 'string') {
                    showGameOverModal(winner);
                } else {
                    console.error("Kein gültiger Gewinner wurde festgelegt.");
                }
            } else {
                requestAnimationFrame(gameLoop);
            }
        }
        gameLoop();
    }else
            console.log("Canvas for Pong game not found.");
    }



function showTournament() {
    const canvas = document.getElementById('canvastour');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        console.log("Canvas-Element gefunden.");

        let isGamePaused = false;

        
        const numPlayers = parseInt(prompt('Please select the number of players for the tournament (4, 8, 16):'));
        if (![4, 8, 16].includes(numPlayers)) {
            alert('Invalid number of players. The tournament can only be held with 4, 8, or 16 players.');
            return;
        }
        
        let playerNames = getPlayerNames(numPlayers);
        registerPlayers(playerNames);
        createPairings();
        
        document.addEventListener("visibilitychange", function () {
            isGamePaused = document.visibilityState === 'hidden';
        });

        function getPlayerNames(numPlayers) {
            let playerNames = [];
            for (let i = 0; i < numPlayers; i++) {
                playerNames.push(prompt(`Please provide name for player ${i + 1}:`));
            }
            return playerNames;
        }

        function registerPlayers(playerNames) {
            players = playerNames.map(name => new Player(name));
        }

    } else {
        console.log("Canvas-Element nicht gefunden.");
    }
}
