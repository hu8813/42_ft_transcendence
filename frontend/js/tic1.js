function showTic1() {
    const canvas = document.getElementById('canvasTic1');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let currentPlayer = 'X'; 
    let gameOver = false;

    const tileWidth = canvas.width / 3;
    const tileHeight = canvas.height / 3;

    let board = Array(3).fill().map(() => Array(3).fill(null));

    const drawBoard = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#FFF';

        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(i * tileWidth, 0);
            ctx.lineTo(i * tileWidth, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * tileHeight);
            ctx.lineTo(canvas.width, i * tileHeight);
            ctx.stroke();
        }

        board.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                const x = cellIndex * tileWidth + tileWidth / 2;
                const y = rowIndex * tileHeight + tileHeight / 2;

                if (cell === 'X') {
                    drawX(x, y);
                } else if (cell === 'O') {
                    drawO(x, y);
                }
            });
        });
    };

    const handleResult = result => {
        if (result) {
            setTimeout(() => alert(result), 10);
        }
    };

    const drawX = (x, y) => {
        const offset = 50;
        ctx.strokeStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(x - offset, y - offset);
        ctx.lineTo(x + offset, y + offset);
        ctx.moveTo(x + offset, y - offset);
        ctx.lineTo(x - offset, y + offset);
        ctx.stroke();
    };

    const drawO = (x, y) => {
        const radius = 40;
        ctx.strokeStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
    };

    const checkForWinOrDraw = () => {
        const totalMoves = board.flat().filter(cell => cell !== null).length;
        if (totalMoves < 5) {
            return false;
        }
    
        const winConditions = [
            [[0, 0], [0, 1], [0, 2]],
            [[1, 0], [1, 1], [1, 2]],
            [[2, 0], [2, 1], [2, 2]],
            [[0, 0], [1, 0], [2, 0]],
            [[0, 1], [1, 1], [2, 1]],
            [[0, 2], [1, 2], [2, 2]],
            [[0, 0], [1, 1], [2, 2]],
            [[0, 2], [1, 1], [2, 0]]
        ];
    
    for (let condition of winConditions) {
        const [[x1, y1], [x2, y2], [x3, y3]] = condition;
        if (board[x1][y1] && board[x1][y1] === board[x2][y2] && board[x1][y1] === board[x3][y3]) {
            gameOver = true;
            return `${board[x1][y1]} hat gewonnen!`;
        }
    }

    if (totalMoves === 9) {
        gameOver = true;
        return "Unentschieden!";
    }
    
    return null; 
};
            

    const computerMove = () => {
        if (gameOver) return;
    
        let moveMade = false;
        for (let i = 0; i < 3 && !moveMade; i++) {
            for (let j = 0; j < 3 && !moveMade; j++) {
                if (!board[i][j]) {
                    board[i][j] = 'O';
                    if (checkForWinOrDraw()) {
                        moveMade = true;
                        continue;
                    }
                    board[i][j] = null;
                        board[i][j] = 'X';
                    if (checkForWinOrDraw()) {
                        board[i][j] = 'O';
                        moveMade = true;
                        continue;
                    }
                    board[i][j] = null;
                }
            }
        }
    
        if (!moveMade) {
            if (!board[1][1]) {
                board[1][1] = 'O';
                moveMade = true;
            } else {
                let availableCorners = [[0, 0], [0, 2], [2, 0], [2, 2]].filter(([i, j]) => !board[i][j]);
                if (availableCorners.length > 0) {
                    const [i, j] = availableCorners[Math.floor(Math.random() * availableCorners.length)];
                    board[i][j] = 'O';
                    moveMade = true;
                } else {
                    let availableSides = [[0, 1], [1, 0], [1, 2], [2, 1]].filter(([i, j]) => !board[i][j]);
                    if (availableSides.length > 0) {
                        const [i, j] = availableSides[Math.floor(Math.random() * availableSides.length)];
                        board[i][j] = 'O';
                        moveMade = true;
                    }
                }
            }
        }
    
        if (moveMade) {
            drawBoard();
            let result = checkForWinOrDraw();
            handleResult(result);
        }
    
        if (!gameOver) {
            currentPlayer = 'X';
        }
    };
    
        
        canvas.addEventListener('click', (event) => {
        console.log("Canvas geklickt");
        if (gameOver || currentPlayer !== 'X') return;

        let rect = canvas.getBoundingClientRect();
        let scaleX = canvas.width / rect.width; 
        let scaleY = canvas.height / rect.height;

        let mouseX = (event.clientX - rect.left) * scaleX;
        let mouseY = (event.clientY - rect.top) * scaleY;

        let xIndex = Math.floor(mouseX / tileWidth);
        let yIndex = Math.floor(mouseY / tileHeight);

        if (!board[yIndex][xIndex] && !gameOver) {
            board[yIndex][xIndex] = currentPlayer;
            drawBoard();
            let result = checkForWinOrDraw();
            handleResult(result);
            if (!gameOver) {
                currentPlayer = 'O';
                computerMove();
            }
        }
    });
    drawBoard();
}