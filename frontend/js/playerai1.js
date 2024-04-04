function showPlayerAi1Page(){
    console.log("pong ai1 page");
    const canvas = document.getElementById('playerAiCanvas'); // Aktualisierte ID
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth / 1.5;
    canvas.height = window.innerHeight / 1.5;

    let gameOver = false;
    let winner = '';

    let ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        velocityX: 5,
        velocityY: 5,
        speed: 7,
        color: "#FFF"
    };

    let player1 = {
        x: 0,
        y: (canvas.height - 100) / 2,
        width: 10,
        height: 100,
        score: 0,
        color: "#FFF",
        moveUp: false,
        moveDown: false
    };

    let CPU = {
        x: canvas.width - 10,
        y: (canvas.height - 100) / 2,
        width: 10,
        height: 100,
        score: 0,
        color: "#FFF"
    };

    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'w':
                player1.moveUp = true;
                break;
            case 's':
                player1.moveDown = true;
                break;
        }
    });

    document.addEventListener('keyup', function(event) {
        switch(event.key) {
            case 'w':
                player1.moveUp = false;
                break;
            case 's':
                player1.moveDown = false;
                break;
        }
    });

    function showNGameButton() {
        const button = document.getElementById('newGameButton');
        button.style.display = 'block'; // Button anzeigen
        button.addEventListener('click', function() {
            location.reload(); // Die Seite neu laden für ein neues Spiel
        });
    }

    const resetBall = () => {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = -ball.velocityX;
        ball.speed = 7;
    };

    const collision = (b, p) => {
        b.top = b.y - b.radius;
        b.bottom = b.y + b.radius;
        b.left = b.x - b.radius;
        b.right = b.x + b.radius;

        p.top = p.y;
        p.bottom = p.y + p.height;
        p.left = p.x;
        p.right = p.x + p.width;

        return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
    };

    function showGameOver() {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText(winner, canvas.width / 4, canvas.height / 2);
    
        showNGameButton(); // Zeigt den "Neues Spiel" Button an
    }

    const update = () => {
        if (player1.score === 7 || CPU.score === 7) {
            gameOver = true;
            winner = player1.score === 7 ? "Player 1 wins!" : "CPU wins!";
            showGameOver(); // Eine Funktion, um den Gewinner anzuzeigen und den "Neues Spiel" Button einzublenden
            return; // Stoppt die Update-Funktion, um weitere Bewegungen zu verhindern
        } 

        if(player1.moveUp && player1.y > 0) {
            player1.y -= 8;
        }
        if(player1.moveDown && (player1.y + player1.height) < canvas.height) {
            player1.y += 8;
        }

        // Einfache KI für Player 2
        CPU.y += ((ball.y - (CPU.y + CPU.height / 2))) * 0.1;

        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.velocityY = -ball.velocityY;
        }

        if(ball.x - ball.radius < 0) {
            CPU.score++;
            resetBall();
        } else if(ball.x + ball.radius > canvas.width) {
            player1.score++;
            resetBall();
        }

        if(collision(ball, player1) || collision(ball, CPU)) {
            ball.velocityX = -ball.velocityX;
        }
    };

    const drawRect = (x, y, w, h, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    };

    const drawCircle = (x, y, r, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
    };

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawRect(0, 0, canvas.width, canvas.height, '#000'); // Background
        drawRect(player1.x, player1.y, player1.width, player1.height, player1.color); // Player 1
        drawRect(CPU.x, CPU.y, CPU.width, CPU.height, CPU.color); // Player 2
        drawCircle(ball.x, ball.y, ball.radius, ball.color); // Ball
        ctx.font = '35px Arial';
        ctx.fillStyle = '#FFF';
        ctx.fillText(player1.score, 100, 50);
        ctx.fillText(CPU.score, canvas.width - 100, 50);
    };

    const gameLoop = () => {
        if (!gameOver) {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        } else {
            showGameOverModal();
        }
    };

    /* function showGameOverModal() {
        const modal = document.getElementById('playerAiModal'); // Aktualisierte ID
        modal.classList.remove('hidden');
        const winnerText = document.getElementById('playerAiWinner'); // Aktualisierte ID
        winnerText.textContent = `${winner} wins!`;
        // Hinzufügen von EventListener zu "Neu starten"-Button...
    } */
    function showGameOverModal() {
        const modal = document.getElementById('playerAiModal');
        modal.style.display = 'block'; // Zeigt das Modal an
        const winnerText = document.getElementById('playerAiWinner');
        winnerText.textContent = `${winner} Congratulations!`;
    }
    
    function resetGame() {
        // Setze die Spielvariablen zurück
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = 5; // oder jede andere Startgeschwindigkeit
        ball.velocityY = 5; // oder jede andere Startgeschwindigkeit
        ball.speed = 7;
    
        player1.y = (canvas.height - 100) / 2; // Zurücksetzen der Position
        CPU.y = (canvas.height - 100) / 2; // Zurücksetzen der Position
    
        player1.score = 0; // Zurücksetzen der Punktzahl
        CPU.score = 0; // Zurücksetzen der Punktzahl
    
        gameOver = false; // Spielende zurücksetzen
        winner = ''; // Gewinner zurücksetzen
    
        // Starte das Spiel erneut
        gameLoop();
    }
    

    gameLoop();
    };