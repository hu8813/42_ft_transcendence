function showGameModes() {
    const initialVisibleData = [
        {
            text: "Pong42",
            imgPlaceholder: './src/pong42.png',
            href: "#pong42",
            associatedCards: ["#player3d1", "#playerai1", "#pongMultiplayer"] // IDs of associated cards
        },
        {
            text: "Tic Tac Toe",
            imgPlaceholder: './src/tictactoe.png',
            href: "#tictactoe",
            associatedCards: ["#xoxo1", "#xoxo2", "#xoxo3", "#xoxo4"] // IDs of associated cards
        }
    ];

    const additionalData = [
        {
            text: "Training (3D)",
            imgPlaceholder: '../src/cpu.jpeg',
            href: "#player3d1",
        },
        {
            text: "Single Player (against CPU)",
            imgPlaceholder: '../src/playagainst.jpeg',
            href: "#playerai1",
        },
        {
            text: "Multiplayer",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#pongMultiplayer",
            associatedCards: ["#pongehab", "#pong3", "#pong4"] // IDs of associated cards
        },
        {
            text: "Multiplayer 2 Players (local)",
            imgPlaceholder: './src/tournament.jpeg',
            href: "#pongehab",
        },
        {
            text: "Multiplayer 3 Players (local)",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#pong3",
        },
        {
            text: "Multiplayer 4 Players (local)",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#pong4",
        },
        {
            text: "Single Player (CPU)",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#xoxo1",
        },
        {
            text: "Multiplayer (local)",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#xoxo2",
        },
        {
            text: "Tournament",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#xoxo3",
        },
        {
            text: "Tic Tac toe",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#xoxo4",
        },
        
    ];

    const container = document.querySelector('.gameModes');
    const cardsContainer = document.createElement('div');
    let isDeeperLevel = false; // Flag to track if the user has navigated to a deeper level
    initialVisibleData.forEach(data => createCard(data, cardsContainer));

    function createCard(data, parent) {
        const card = document.createElement('div');
        card.classList.add('bn');
        card.style.padding = "5px";
        const link = document.createElement('a');
        link.href = data.href;
        link.classList.add('link');
        link.style.textDecoration = "none";
        const textDiv = document.createElement('div');
        textDiv.classList.add('text');
        textDiv.textContent = data.text;
        textDiv.style.textAlign = "center";
        textDiv.style.color = "white";
        textDiv.style.paddingBottom = "10px";
        link.appendChild(textDiv);
        const imgDiv = document.createElement('div');
        imgDiv.style.display = "flex";
        imgDiv.style.justifyContent = "center";
        const img = document.createElement('img');
        img.src = data.imgPlaceholder;
        img.alt = 'Image Placeholder';
        img.style.width = "150px";
        img.style.height = "150px";
        link.appendChild(imgDiv);
        imgDiv.appendChild(img);
        card.appendChild(link);
        card.style.borderStyle = "solid";
        parent.appendChild(card);
        card.addEventListener('click', (event) => {
            if (data.text === "Pong42" || data.text === "Tic Tac Toe" || data.text === "Multiplayer") {
                event.preventDefault();
                isDeeperLevel = true;
                backButton.style.display = 'inline-block';
                backButton.classList.add('bn');
            }
            cardsContainer.innerHTML = '';
            if (data.associatedCards) {
                data.associatedCards.forEach(id => {
                    const additionalCardData = additionalData.find(item => item.href === id);
                    if (additionalCardData) {
                        createCard(additionalCardData, cardsContainer);
                    }
                });
            }
        });
    }

    const backButton = document.createElement('button');
    backButton.textContent = 'Back';
    backButton.style.display = 'none';
    const buttonStyle = document.createElement('style');
    buttonStyle.textContent = `
    .custom-back-button {
        background-color: #21d4fd;  /* Light blue */
        color: white;
        border: none;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
        border-radius: 5px;  /* Rounded corners */
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);  /* Optional shadow */
        transition: all 0.2s ease-in-out;  /* Smooth hover effect */
    }
    .custom-back-button:hover {
        background-color: #2969a1;  /* Darker blue on hover */
    }
`;
    document.head.appendChild(buttonStyle);
    backButton.classList.add('custom-back-button');
    backButton.style.margin = '10px 10px';
    backButton.style.display = 'none';
    backButton.innerHTML = '<i class="bi bi-arrow-left"></i> Back'; // Adding Bootstrap back icon
    backButton.addEventListener('click', () => {
        cardsContainer.innerHTML = '';
        initialVisibleData.forEach(data => createCard(data, cardsContainer));
        backButton.style.display = 'none';
        isDeeperLevel = false;
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.appendChild(backButton);

    const title = document.createElement("h1");
    title.textContent = "Select Game Mode";
    translateKey('game.selectGame').then(selectGameTranslation => {
        title.innerHTML = `<span id="selectGame">${selectGameTranslation}</span>`;
    });
    title.style.textAlign = "center";
    title.style.fontSize = "50px";
    title.style.paddingTop = "50px";
    container.appendChild(title);
    container.appendChild(buttonContainer);
    container.appendChild(cardsContainer);
    title.classList.add('animated-title');

    cardsContainer.style.display = "grid";
    cardsContainer.style.gridTemplateColumns = "repeat(2, 2fr)";
    cardsContainer.style.gap = "20px";
    cardsContainer.style.padding = "0px 10px";
}
