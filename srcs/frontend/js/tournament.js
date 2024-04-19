function showTournament() {
    const canvas = document.getElementById('canvastour');
    if (canvas) {

        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        console.log("Canvas-Element gefunden.");

        let gameOver = false;
        let isGamePaused = false;
        const players = [];
        const matches = [];

        class Player {
            constructor(name) {
                this.name = name;
                this.score = 0;
            }
        }

        document.addEventListener("visibilitychange", function () {
            if (document.visibilityState === 'hidden') {
                isGamePaused = true;
            } else {
                isGamePaused = false;
            }
        });

        function getPlayerNames(numPlayers) {
            const playerNames = [];
            for (let i = 0; i < numPlayers; i++) {
                const playerName = prompt(`Please provide name for player ${i + 1} ein:`);
                playerNames.push(playerName);
            }
            return playerNames;
        }

        function registerPlayers(playerNames) {
            playerNames.forEach(name => {
                const player = new Player(name);
                players.push(player);
            });
        }

        /* function drawPairings(matches) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
        
            matches.forEach((match, index) => {
                ctx.fillText(`Match ${index + 1}: ${match[0].name} vs ${match[1].name}`, 10, 30 + index * 30);
            });
        } */
        function drawPairings() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Bereinige das Canvas
            ctx.font = '16px Arial';
            ctx.fillStyle = 'black';

            matches.forEach((match, index) => {
                const text = `Match ${index + 1}: ${match[0].name} vs ${match[1].name}`;
                ctx.fillText(text, 10, 30 + index * 30);
            });
        }

        function createPairings() {
            const shuffledPlayers = players.sort(() => Math.random() - 0.5);
            matches.length = 0;
            for (let i = 0; i < shuffledPlayers.length; i += 2) {
                if (shuffledPlayers[i + 1]) {
                    const match = [shuffledPlayers[i], shuffledPlayers[i + 1]];
                    matches.push(match);
                }
                drawPairings();
            }
        }

        

        function startRound() {
            if (players.length >= 2) {
                createPairings();
                console.log('The pairings for this round are:');
                matches.forEach((match, index) => {
                    console.log(`Match ${index + 1}: ${match[0].name} vs ${match[1].name}`);
                });
            } else {
                console.log('Not enough players for the tournament.');
            }
        }

        function showGameOverModal(winner) {
            gameOverMessage = `${winner} hat gewonnen!`;
            showGameOverModal2(winner);
            gameOver = true;
        }

        function TButton() {
            const button = document.getElementById('TButton');
            if (button) {
                button.style.display = 'block';
                button.addEventListener('click', function () {
                    location.reload();
                });
            }
        }

        const numPlayers = parseInt(prompt('Please select the number of players for the tournament (4, 8 or 16):'));
        if (![4, 8, 16].includes(numPlayers)) {
            alert('Invalid number of players. The tournament can only be held with 4, 8 or 16 players.');
        } else {
            const playerNames = getPlayerNames(numPlayers);
            registerPlayers(playerNames);
            startRound();
        }
    } else {
        console.log("Canvas-Element nicht gefunden.");
    }
}
