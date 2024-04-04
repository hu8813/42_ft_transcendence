function showGameModes() {
    const cardsData = [
        {
            text: "Training",
            imgPlaceholder: 'https://via.placeholder.com/150',
        },
        {
            text: "Single Player",
            imgPlaceholder: 'https://via.placeholder.com/150',
        },
        {
            text: "Multiplayer",
            imgPlaceholder: 'https://via.placeholder.com/150',
        },
        {
            text: "Tournament",
            imgPlaceholder: 'https://via.placeholder.com/150',
        },
    ];

    const container = document.querySelector('.gameModes');
    const cardsContainer = document.createElement('div');

    cardsData.forEach(data => {
        const card = document.createElement('div');
        card.classList.add('card', 'bn');

        const textDiv = document.createElement('div');
        textDiv.classList.add('text');
        textDiv.textContent = data.text;
        card.appendChild(textDiv);

        const imgDiv = document.createElement('div');
        imgDiv.classList.add('img', 'bn');
        const img = document.createElement('img');
        img.src = data.imgPlaceholder;
        img.alt = 'Image Placeholder';
        imgDiv.appendChild(img);
        card.appendChild(imgDiv);

        cardsContainer.appendChild(card);
    });

    const title = document.createElement("h1");
    title.textContent = "GAME MODES";
    title.style.textAlign = "center";
    title.style.fontSize = "50px";
    title.style.paddingTop = "50px";
    container.appendChild(title);
    container.appendChild(cardsContainer);
    title.classList.add('animated-title');
    
    cardsContainer.style.display = "grid";
    cardsContainer.style.gridTemplateColumns = "repeat(2, 2fr)";
    cardsContainer.style.gap = "20px";
    cardsContainer.style.padding = "0px 10px";
}
