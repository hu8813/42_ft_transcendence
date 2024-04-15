function showTic1() {
    const canvas = document.getElementById('canvasTic1');
    if (canvas) {
        const context = canvas.getContext('2d');
        const canvasSize = 500;
        const sectionSize = canvasSize / 3;
        let currentPlayer = 'X';
        const lineColor = "#8f957d";
        const board = Array(3).fill(null).map(() => Array(3).fill(null));

        canvas.width = canvasSize;
        canvas.height = canvasSize;
        context.translate(0.5, 0.5);

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


        function nGButton() {
            const button = document.getElementById('nGButton');
            if (button)
            {
                button.style.display = 'block';
                button.addEventListener('click', function() {
                location.reload();
            });
          }
        }

        function showGameOverMessage(winner) {
        const message = winner === 'nowinner' ? 'The game is tied!' : `Player ${winner} has won!`;
        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.fillRect(0, 0, canvasSize, canvasSize);
        context.fillStyle = "white";
        context.font = "48px Arial";
        context.textAlign = "center";
        context.fillText(message, canvasSize / 2, canvasSize / 2);

        setTimeout(() => {
        const nButton2 = document.getElementById('nGButton');
        if (nButton2)
            document.getElementById('nGButton').style.display = 'block';
        nGButton();
        }, 1000);
        } 

        function computerMove() {
            let move = getWinningMove('O') || getBlockingMove('X') || getCenterMove() || getCornerMove() || getSideMove();
            if (!move) return;
            board[move.x][move.y] = 'O';
            drawO(move.x * sectionSize, move.y * sectionSize);
            drawLines(10, lineColor);
        
            let winner = checkWinner();
            if (winner) {
                canvas.removeEventListener('mouseup', handleRelease);
                canvas.removeEventListener('touchend', handleRelease);
                showGameOverMessage(winner);
            }
        }
    
        function playerMove(x, y) {
            if (board[x][y] !== null) {
                return;
            }
    
            board[x][y] = currentPlayer;
            drawX(x * sectionSize, y * sectionSize);
            drawLines(10, lineColor);
    
            let winner = checkWinner();
            if (winner) {
                canvas.removeEventListener('mouseup', handleRelease);
                canvas.removeEventListener('touchend', handleRelease);
                showGameOverMessage(winner);
                return;
            }
    
            computerMove();
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
    
        function isMoveLeft(board) {
            return board.some(row => row.includes(null));
        }

        function evaluate(b) {
            for (let row = 0; row < 3; row++) {
                if (b[row][0] === b[row][1] && b[row][1] === b[row][2]) {
                    if (b[row][0] === 'O') return +10;
                    else if (b[row][0] === 'X') return -10;
                }
            }
            for (let col = 0; col < 3; col++) {
                if (b[0][col] === b[1][col] && b[1][col] === b[2][col]) {
                    if (b[0][col] === 'O') return +10;
                    else if (b[0][col] === 'X') return -10;
                }
            }
            if (b[0][0] === b[1][1] && b[1][1] === b[2][2]) {
                if (b[0][0] === 'O') return +10;
                else if (b[0][0] === 'X') return -10;
            }
            if (b[0][2] === b[1][1] && b[1][1] === b[2][0]) {
                if (b[0][2] === 'O') return +10;
                else if (b[0][2] === 'X') return -10;
            }
            return 0;
        }

        function minimax(board, depth, isMax) {
            let score = evaluate(board);

            if (score === 10) return score - depth;
            if (score === -10) return score + depth;
            if (!isMoveLeft(board)) return 0;

            if (isMax) {
                let best = -1000;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (board[i][j] === null) {
                            board[i][j] = 'O';
                            best = Math.max(best, minimax(board, depth + 1, !isMax));
                            board[i][j] = null;
                        }
                    }
                }
                return best;
            } else {
                let best = 1000;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (board[i][j] === null) {
                            board[i][j] = 'X';
                            best = Math.min(best, minimax(board, depth + 1, !isMax));
                            board[i][j] = null;
                        }
                    }
                }
                return best;
            }
        }

        function findBestMove(board) {
            let bestVal = -1000;
            let bestMove = { row: -1, col: -1 };
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[i][j] === null) {
                        board[i][j] = 'O';
                        let moveVal = minimax(board, 0, false);
                        board[i][j] = null;
                        if (moveVal > bestVal) {
                            bestMove = { row: i, col: j };
                            bestVal = moveVal;
                        }
                    }
                }
            }
            return bestMove;
        }

        function computerMove() {
            let move;
            if (isMoveLeft(board)) {
                move = findBestMove(board);
                if (move.row !== -1 && move.col !== -1) {
                    board[move.row][move.col] = 'O';
                    drawO(move.row * sectionSize, move.col * sectionSize);
                    drawLines(10, lineColor);
                }
            }
        
            let winner = checkWinner();
            if (winner) {
                canvas.removeEventListener('mouseup', handleRelease);
                canvas.removeEventListener('touchend', handleRelease);
                showGameOverMessage(winner);
            }
        }

        function handleRelease(event) {
            event.preventDefault();
            if (currentPlayer === 'O')
                return;
            let position = getCanvasMousePosition(event.changedTouches ? event.changedTouches[0] : event);
            const x = Math.floor(position.x / sectionSize);
            const y = Math.floor(position.y / sectionSize);

            if (board[x][y] !== null) {
                return;
            }

            board[x][y] = 'X';
            drawX(x * sectionSize, y * sectionSize);
            drawLines(10, lineColor);

            let winner = checkWinner();
            if (winner) {
                canvas.removeEventListener('mouseup', handleRelease);
                canvas.removeEventListener('touchend', handleRelease);
                showGameOverMessage(winner);
            } else {
                currentPlayer = 'O';
                computerMove();
                currentPlayer = 'X';
            }
        }
        canvas.addEventListener('mouseup', handleRelease);
        canvas.addEventListener('touchend', handleRelease);

        drawLines(10, lineColor);
    }
}
