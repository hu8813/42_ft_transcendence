function showTic2() {
    const canvas = document.getElementById('canvasTic2');
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


        function nNButton() {
            const button = document.getElementById('nNButton');
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
        const nButton2 = document.getElementById('nNButton');
        if (nButton2)
            document.getElementById('nNButton').style.display = 'block';
        nNButton();
        }, 1000);
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

                    board[x][y] = player === 1 ? 'X' : 'O';
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

        /* function handleMouseUp(event) {
            const canvasMousePosition = getCanvasMousePosition(event);
            addPlayingPiece(canvasMousePosition);
            drawLines(10, lineColor);
        } */

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