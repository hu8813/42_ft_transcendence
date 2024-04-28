async function showTournamentPage() {
    async function askPlayerCount(tournamentName) {
        const canvas = document.getElementById('canvastour');
        if (!canvas) return;
    
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        let howmany = await translateKey("howmany");
        ctx.fillText(howmany, canvas.width / 2, canvas.height / 2.3);
    
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(canvas.width / 4 - 50, canvas.height / 2, 100, 50);
        ctx.fillStyle = "white";
        ctx.fillText("4", canvas.width / 4, canvas.height / 2 + 35);
    
        ctx.fillStyle = "#008CBA";
        ctx.fillRect(3 * canvas.width / 4 - 50, canvas.height / 2, 100, 50);
        ctx.fillStyle = "white";
        ctx.fillText("8", 3 * canvas.width / 4, canvas.height / 2 + 35);
    
        canvas.addEventListener('click', function handler(e) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
    
            const playerCount = x < canvas.width / 3 ? 4 : 8;
            
            canvas.removeEventListener('click', handler);
    
            getPlayerNames(playerCount, 1, [], tournamentName);
        });
    }
    
    async function getPlayerNames(playerCount, currentPlayerIndex, players, tournamentName) {
        const canvas = document.getElementById('canvastour');
        const input = document.createElement('input');
        if (!canvas) return;
    
        input.type = 'text';
        let enter = await translateKey("enter");
        input.placeholder = enter+` ${currentPlayerIndex}`;
        input.style.position = 'absolute';
        input.style.zIndex = '10';
        document.body.appendChild(input);
    
        const updateInputPositionAndSize = () => {
            if (!document.body.contains(input)) return;
            const canvasRect = canvas.getBoundingClientRect();
            const canvasWidth = canvasRect.width;
            
            const inputWidth = Math.max(250, Math.min(380, canvasWidth * 0.8));
            input.style.width = `${inputWidth}px`;
            const fontSize = Math.max(inputWidth / 25, 12);
            input.style.fontSize = `${fontSize}px`;
    
            input.style.left = `${canvasRect.left + canvasWidth / 2}px`;
            input.style.top = `${canvasRect.top + canvasRect.height * 0.65}px`;
            input.style.transform = 'translate(-50%, -50%)';
        };
    
        updateInputPositionAndSize();
        window.addEventListener('resize', updateInputPositionAndSize);
    
            function removeInput() {
                if (document.body.contains(input)) {
                    document.body.removeChild(input);
                    window.removeEventListener('resize', updateInputPositionAndSize);
                    document.removeEventListener('visibilitychange', checkCanvasVisibility);
                    clearInterval(visibilityInterval);
                }
            }
    
            function checkCanvasVisibility() {
                if (document.visibilityState !== 'visible' || !document.body.contains(canvas) || canvas.offsetWidth === 0) {
                    removeInput();
                }
            }
        
            document.addEventListener('visibilitychange', checkCanvasVisibility);
            const visibilityInterval = setInterval(checkCanvasVisibility, 500);
        
        input.focus();
    
        input.onkeydown = function(event) {
            if (event.key === 'Enter') {
                let playerName = input.value.replace(/[^a-z0-9]/gi, '').substring(0, 10);
                if (!playerName) {
                    playerName = `X${currentPlayerIndex}`;
                } else {
                    let suffix = 1;
                    let originalPlayerName = playerName;
                    while (players.includes(playerName)) {
                        playerName = `${originalPlayerName}${suffix}`;
                        suffix++;
                    }
                }
                 players.push(playerName);
                 removeInput();
                 if (currentPlayerIndex < playerCount) {
                    getPlayerNames(playerCount, currentPlayerIndex + 1, players);
                } else {
                    shuffleArray(players);
                    showTournament(players, playerCount, tournamentName);
                }
            }
        };
    }
    
    async function askTournamentName() {
        const canvas = document.getElementById('canvastour');
        if (!canvas) return;
    
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        let enterName = await translateKey("enterTournamentName");
        ctx.fillText(enterName, canvas.width / 2, canvas.height / 2.3);
    
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = enterName;
        input.style.position = 'absolute';
        input.style.zIndex = '10';
        document.body.appendChild(input);
    
        const updateInputPositionAndSize = () => {
            if (!document.body.contains(input)) return;
            const canvasRect = canvas.getBoundingClientRect();
            const canvasWidth = canvasRect.width;
            
            const inputWidth = Math.max(250, Math.min(380, canvasWidth * 0.8));
            input.style.width = `${inputWidth}px`;
            const fontSize = Math.max(inputWidth / 25, 12);
            input.style.fontSize = `${fontSize}px`;
    
            input.style.left = `${canvasRect.left + canvasWidth / 2}px`;
            input.style.top = `${canvasRect.top + canvasRect.height * 0.65}px`;
            input.style.transform = 'translate(-50%, -50%)';
        };
    
        updateInputPositionAndSize();
        window.addEventListener('resize', updateInputPositionAndSize);
    
        input.focus();
    
        input.addEventListener('keydown', async function(event) {
            if (event.key === 'Enter') {
                const tournamentName = input.value.trim();
                if (!tournamentName) {
                    return;
                }
                document.body.removeChild(input);
                await askPlayerCount(tournamentName);
            }
        });
    }
    
    async function showTournament(players, playerCount, tournamentName) {
        const canvas = document.getElementById('canvastour');
        if (!canvas) return;
        const gameData = [];
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
    
        shuffleArray(players);
    
        let currentMatch = 0;
        let roundMatches = Math.floor(playerCount / 2);
        let winners = [];
    
        function displayMessage(message, duration) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        
            ctx.font = "bold 30px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
        
            const lines = message.split('\n');
            const lineHeight = 30;
            const startingHeight = (canvas.height - (lines.length * lineHeight)) / 2;
    
            lines.forEach((line, index) => {
                ctx.fillText(line, canvas.width / 2, startingHeight + index * lineHeight);
            });
            setTimeout(function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }, duration);
        }
        
        async function nextMatch() {
            if (currentMatch >= roundMatches) { 
                players.splice(0, players.length, ...winners);
                winners = [];
                roundMatches /= 2;
                currentMatch = 0;
                if (roundMatches < 1) {
                    let winner = await translateKey("winner");
                    let congrats = await translateKey("congrats");
                    console.log(`The winner of the tournament is Player ${players[0]}! Congratulations!`);
                    //localStorage.getItem('userNickname') + " " + tournamentName;
                    //gameData.push({result: players[0], name: tournamentName});
                    await sendTournamentData(gameData,  players[0]);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
                    ctx.fillStyle = "#FFF";        
                    ctx.font = "bold 30px Arial";
                    ctx.textAlign = "center";
                    
                    ctx.fillText(winner, canvas.width / 2 , canvas.height / 3);
                    ctx.fillText(`🏆🏆   ${players[0]} !  🏆🏆`, canvas.width / 2 , canvas.height / 2.4);
                    //ctx.fillText(`${players[0]} !`, canvas.width / 2 , canvas.height / 2.4);
                    ctx.fillText(congrats, canvas.width / 2 , canvas.height / 2);
                    return;
                }
            }
            let matchPlayers = [players[currentMatch * 2], players[currentMatch * 2 + 1]];
            console.log(` ${currentMatch + 1}:  ${matchPlayers[0]}  vs  ${matchPlayers[1]}`);
            displayMessage(` ${matchPlayers[0]} vs  ${matchPlayers[1]}`, 3000);
            setTimeout(function() {
                showPongTour(matchPlayers[0], matchPlayers[1], roundMatches === 1, handleWinner);
            }, 3000); 
        }    
    
        async function sendTournamentData(tournamentData, winnerName) {
            try {
                let csrfToken = await getCSRFCookie();
                let jwtToken = localStorage.getItem('jwtToken');
                tournamentName = localStorage.getItem('userNickname') + ":pong " + tournamentName;
    
                const response = await fetch('/api/save_tournament_data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'Authorization': `Bearer ${jwtToken}`
                    },
                    body: JSON.stringify({ tournamentData, name: tournamentName, winner: winnerName })
    
                    //body: JSON.stringify({ tournamentData}, {name: tournamentName, winner: winnerName })
                });
        
                if (response.ok) {
                    const responseData = await response.json();
                    console.log(responseData.message);  
                } else {
                    throw new Error('Failed to send tournament data to the backend');
                }
            } catch (error) {
                console.error('Error sending tournament data to the backend:', error);
            }
        }
    
        async function handleWinner(winnerName) {
            winners.push(winnerName);
            currentMatch++;
            
            try {
                const jwtToken = localStorage.getItem('jwtToken');
                const csrfToken = await getCSRFCookie(); 
                
                 
                for (let i = 0; i < winners.length; i++) {
                    const matchPlayers = [players[i * 2], players[i * 2 + 1]];
                    const gameResult = winners[i] ? `${winners[i]} won!` : '';  
                    gameData.push({ matchNumber: i + 1, players: matchPlayers, result: gameResult });
                }
                
                // Send tournament data to the backend
               
            } catch (error) {
                console.error('Error saving tournament data:', error);
            }
            nextMatch();
        }
        
    
        
        let tourna = await translateKey("tourna");
        let tournamentData = []; 
        console.log("Tournament starts now.");
        let initialMessage = tourna+"\n";
        let plan = tourna+"\n";
        for (let i = 0; i < roundMatches; i++) {
            let matchPlayers = [players[i * 2], players[i * 2 + 1]];
            plan += `Match ${i + 1}:  ${matchPlayers[0]} vs  ${matchPlayers[1]}\n`;
            let matchResult = `${i + 1}: ${matchPlayers[0]} vs ${matchPlayers[1]}`;
            console.log(matchResult); 
            tournamentData.push({ matchNumber: i + 1, players: matchPlayers, result: null, tournamentName: tournamentName });
        }
        displayMessage(initialMessage, 3000);
        displayMessage(plan, 7000);
    
    
        setTimeout(nextMatch, 3000);
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    function showPongTour(player1Name, player2Name, isFinal, handleWinner) {
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
    
            name: player1Name,
            x: 10,
            y: canvas.height / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            color: '#FFF',
            score: 0
        };
    
        const player2 = {
            name: player2Name,
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
    
        document.addEventListener("visibilitychange", function () {
            if (document.visibilityState === 'hidden') {
                isGamePaused = true;
            } else {
                isGamePaused = false;
            }
        });
    
        showStartMessageWithCountdown(5);
    
        async function showStartMessageWithCountdown(seconds) {
            if (seconds > 0) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
        
                ctx.fillStyle = "#FFF";
                ctx.font = "20px Arial";
                ctx.textAlign = "left";
        
                let useWS = await translateKey("useWS");
                ctx.fillText(useWS+" (W / S)", 20, canvas.height / 2 + 10);
        
                ctx.fillText(useWS+" (↑ / ↓)", canvas.width - 150, canvas.height / 2 + 10);
                ctx.font = "bold 30px Arial";
                let whoevergets = await translateKey("whoevergets");
                ctx.fillText(whoevergets, canvas.width / 2 - 220, canvas.height / 2 - 20);
    
                ctx.font = "bold 30px Arial";
                let starting = await translateKey("starting");
                ctx.fillText(starting + seconds, canvas.width / 2 - 100, canvas.height / 2 + 50);
    
                setTimeout(function () {
                    showStartMessageWithCountdown(seconds - 1);
                }, 1000);
            } else {
                gameLoop();
            }
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
                    break;
                case 40:
                    downArrowPressed = false;
                    break;
            }
        }
    
        function update() {
            if (gameOver|| isGamePaused) return;
    
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
                showGameOverModal(player1.score > player2.score ? player1.name : player2.name);
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
            ctx.textAlign = "start";
            ctx.fillStyle = "#FFF";
            ctx.font = "32px Arial";
            ctx.fillText(`${player1Name} : ${player1.score}`, 20, 50);
            ctx.fillText(`${player2Name} : ${player2.score}`, canvas.width - 200, 50);
        }
    
        function showGameOverModal(winnerName) {
            console.log(`${winnerName} won!`);
            showGameOverModal2(winnerName);
            setTimeout(function() {
                handleWinner(winnerName);
            }, 3000);
        }
    
        function showGameOverModal2(winnerName) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setTimeout(async function() {
            let won = await translateKey("won");
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#FFF";
            ctx.font = "bold 30px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`🏆 ${winnerName} `+won+` 🏆`, canvas.width / 2, canvas.height / 2);
        }, 1000);
        }
    }
    
    const canvas = document.getElementById('canvastour');
    if (canvas) {
    await askPlayerCount("Tournament");
    }
    
    }