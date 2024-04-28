async function showTournamentTicPage() {
    async function askPlayerCount(tournamentName) {
        const canvas = document.getElementById('canvasTouTic2');
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
        const canvas = document.getElementById('canvasTouTic2');
        if (!canvas) return;
        const input = document.createElement('input');
    
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
        const canvas = document.getElementById('canvasTouTic2');
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
        const canvas = document.getElementById('canvasTouTic2');
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
                //ctx.clearRect(0, 0, canvas.width, canvas.height);
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
                    await sendTournamentData(gameData,  players[0]);
                    canvas.width = 800;
                    canvas.height = 600;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
                    ctx.fillStyle = "#FFF";        
                    ctx.font = "bold 30px Arial";
                    ctx.textAlign = "center";
                    
                    ctx.fillText(winner, canvas.width / 2 , canvas.height / 3);
                    ctx.fillText(`🏆🏆   ${players[0]} !  🏆🏆`, canvas.width / 2 , canvas.height / 2.4);
                    ctx.fillText(congrats, canvas.width / 2 , canvas.height / 2);
                    return;
                }
            }
            let matchPlayers = [players[currentMatch * 2], players[currentMatch * 2 + 1]];
            console.log(` ${currentMatch + 1}:  ${matchPlayers[0]}  vs  ${matchPlayers[1]}`);
            displayMessage(` ${matchPlayers[0]}  vs  ${matchPlayers[1]}`, 3000);
            setTimeout(function() {
                showTicTacToeMatch(matchPlayers[0], matchPlayers[1], roundMatches === 1, handleWinner);
            }, 3000); 
        }    
    
        async function sendTournamentData(tournamentData, winnerName) {
            try {
                let csrfToken = await getCSRFCookie();
                let jwtToken = localStorage.getItem('jwtToken');
                tournamentName = localStorage.getItem('userNickname') + ":tic_tac " + tournamentName;
    
                const response = await fetch('/api/save_tournament_data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                        'Authorization': `Bearer ${jwtToken}`
                    },
                    body: JSON.stringify({ tournamentData, name: tournamentName, winner: winnerName })
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
            console.log(winnerName + " wins the match!");
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
    
    async function showTicTacToeMatch(player1Name, player2Name, isFinalRound, handleWinner) {
        const canvas = document.getElementById('canvasTouTic2');
        if (!canvas) {
            console.log('Canvas not found');
            return;
        }
        if (canvas) {
            const context = canvas.getContext('2d');
            const canvasSize = 500;
            const sectionSize = canvasSize / 3;
            let player = 1;
            let isProcessingMove = false;
            const lineColor = "#8f957d";
            const board = Array(3).fill(null).map(() => Array(3).fill(null));
    
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            context.translate(0.5, 0.5);
            console.log('Drawing initial board');
    
            function checkWinner() {
                for (let i = 0; i < 3; i++) {
                    if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== null) {
                        return board[i][0];
                    }
                    if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[0][i] !== null) {
                        return board[0][i];
                    }
                }
                if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== null) {
                    return board[0][0];
                }
                if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== null) {
                    return board[0][2];
                }
                let isBoardFull = true;
                for (let x = 0; x < 3; x++) {
                    for (let y = 0; y < 3; y++) {
                        if (board[x][y] === null) {
                            isBoardFull = false;
                            break;
                        }
                    }
                    if (!isBoardFull) break;
                }
            
                if (isBoardFull) {
                    return 'nowinner';
                }
                return null;
            }

        async function showGameOverMessage(winner) {
            const context = canvas.getContext('2d');
            canvas.width = 650;
            canvas.height = 600;
            const canvasSize = canvas.width;
            context.fillStyle = "rgba(0, 0, 0, 0.7)";
            context.fillRect(0, 0, canvasSize, canvasSize);
            context.fillStyle = "white";
            context.font = "48px Arial";
            context.textAlign = "center";
            
            let tied = await translateKey("tied");
            let tied2 = await translateKey("tied2");
            const message = winner === 'nowinner' ? tied : `🏆 ${winner} 🏆`;
            context.fillText(message, canvasSize / 2, canvasSize / 2);
            if (winner === 'nowinner'){
                context.font = "30px Arial";
                context.fillStyle = "white";
                context.textAlign = "center";
                context.fillText( tied2, canvas.width / 2, canvas.height / 1.5);
            }

        
            setTimeout(() => {
                context.clearRect(0, 0, canvasSize, canvasSize);
                if (winner !== 'nowinner') {
                    handleWinner(winner);
                } else {
                    handleTie();
                }
            }, 3000);
        }

        function handleTie() {
            console.log("The game is tied. Deciding next steps.");
            showTicTacToeMatch(player1Name, player2Name, isFinalRound, handleWinner);
        }
        

        function addPlayingPiece(mouse) {
            if (isProcessingMove) return;
            isProcessingMove = true;
    
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    const xCordinate = x * sectionSize;
                    const yCordinate = y * sectionSize;
    
                    if (mouse.x >= xCordinate && mouse.x <= xCordinate + sectionSize &&
                        mouse.y >= yCordinate && mouse.y <= yCordinate + sectionSize) {
    
                        if (board[x][y] !== null) {
                            isProcessingMove = false;
                            return;
                        }
    
                        board[x][y] = player === 1 ? player1Name : player2Name;
                        const drawFunc = player === 1 ? drawX : drawO;
                        drawFunc(xCordinate, yCordinate);
                        drawLines(10, lineColor);
    
                        setTimeout(() => {
                            let winner = checkWinner();
                            if (winner) {
                                showGameOverMessage(winner);
                                canvas.removeEventListener('mouseup', handleRelease);
                                canvas.removeEventListener('touchend', handleRelease);
                            } else {
                                player = 3 - player;
                            }
                            isProcessingMove = false;
                        }, 10);
                        return;
                    }
                }
            }
        }

        function drawO(xCordinate, yCordinate) {
            const halfSectionSize = 0.5 * sectionSize;
            const centerX = xCordinate + halfSectionSize;
            const centerY = yCordinate + halfSectionSize;
            const radius = (sectionSize - 100) / 2;
    
            context.lineWidth = 10;
            context.strokeStyle = "#a32c08";
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            context.stroke();
        }
    
        function drawX(xCordinate, yCordinate) {
            const offset = 50;
            context.strokeStyle = "#667c21";
            context.beginPath();
            context.moveTo(xCordinate + offset, yCordinate + offset);
            context.lineTo(xCordinate + sectionSize - offset, yCordinate + sectionSize - offset);
            context.moveTo(xCordinate + offset, yCordinate + sectionSize - offset);
            context.lineTo(xCordinate + sectionSize - offset, yCordinate + offset);
            context.stroke();
        }
    
            function drawLines(lineWidth, strokeStyle) {
                context.lineWidth = lineWidth;
                context.strokeStyle = strokeStyle;
            
                context.beginPath();
                context.moveTo(sectionSize, 0);
                context.lineTo(sectionSize, canvasSize);
                context.moveTo(2 * sectionSize, 0);
                context.lineTo(2 * sectionSize, canvasSize);
                context.moveTo(0, sectionSize);
                context.lineTo(canvasSize, sectionSize);
                context.moveTo(0, 2 * sectionSize);
                context.lineTo(canvasSize, 2 * sectionSize);
                context.stroke();
            
                context.beginPath();
                context.rect(0, 0, canvasSize, canvasSize);
                context.stroke();
            }
            
            function getCanvasMousePosition(event) {
                const rect = canvas.getBoundingClientRect();
                return {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                }
            }
    
            function getCanvasMousePosition(event) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                let x, y;
    
                if (event.touches) {
                    x = event.touches[0].clientX - rect.left;
                    y = event.touches[0].clientY - rect.top;
                } else {
                    x = event.clientX - rect.left;
                    y = event.clientY - rect.top;
                }
                return {
                    x: x * scaleX,
                    y: y * scaleY
                };
            }
    
            function handleRelease(event) {
                event.preventDefault();
                if (event.type === 'touchend' && event.changedTouches.length > 1) return;
                
                let position;
                if (event.changedTouches) {
                    position = getCanvasMousePosition(event.changedTouches[0]);
                } else {
                    position = getCanvasMousePosition(event);
                }
    
                addPlayingPiece(position);
            }
    
            canvas.addEventListener('mouseup', handleRelease);
            canvas.addEventListener('touchend', handleRelease);
    
            drawLines(10, lineColor);
        }
    
    }
    const canvas = document.getElementById('canvasTouTic2');
    if (canvas) {
    await askPlayerCount("TIC_Tournament");
    }
    
    }