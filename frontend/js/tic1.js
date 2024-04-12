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

    canvas.addEventListener('click', (event) => {
        if (gameOver || currentPlayer !== 'X') return;

        let rect = canvas.getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let scaleY = canvas.height / rect.height;

        let mouseX = (event.clientX - rect.left) * scaleX;
        let mouseY = (event.clientY - rect.top) * scaleY;

        let xIndex = Math.floor(mouseX / tileWidth);
        let yIndex = Math.floor(mouseY / tileHeight);

        if (!board[yIndex][xIndex]) {
            board[yIndex][xIndex] = currentPlayer;
            drawBoard();
            checkForWin();
            currentPlayer = 'O'; 
            computerMove();
        }
    });

    const computerMove = () => {
        if (gameOver) return;

        let availableMoves = [];
        board.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                if (!cell) {
                    availableMoves.push({ rowIndex, cellIndex });
                }
            });
        });

        if (availableMoves.length > 0) {
            const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            board[move.rowIndex][move.cellIndex] = currentPlayer;
            drawBoard();
            checkForWin();
            currentPlayer = 'X'; 
        }
    };

    const checkForWin = () => {
        
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
    
        
        let boardIn1D = board.flat();
    
        for (let i = 0; i < winConditions.length; i++) {
            let [a, b, c] = winConditions[i];
            if (boardIn1D[a] && boardIn1D[a] === boardIn1D[b] && boardIn1D[a] === boardIn1D[c]) {
                gameOver = true; 
                alert(`${boardIn1D[a]} hat gewonnen!`); 
                return;
            }
        }
    
        
        if (boardIn1D.every(cell => cell !== null)) {
            gameOver = true; 
            alert("Unentschieden!");
            return;
        }
    };
    

    drawBoard();
}
