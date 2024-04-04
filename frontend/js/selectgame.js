function showGameModes() {
    const cardsData = [
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
            text: "Multiplayer (locally)",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#pongehab",
        },
        {
            text: "Tournament (remote)",
            imgPlaceholder: './src/tournament.jpeg',
            href: "#playersremote2",
        },
    ];

    const container = document.querySelector('.gameModes');
    const cardsContainer = document.createElement('div');

    cardsData.forEach(data => {
        const card = document.createElement('div');
        card.classList.add('card', 'bn');
    
        const link = document.createElement('a'); // Create <a> element
        link.href = data.href; // Set href attribute
        link.classList.add('link'); // Add a class for styling (optional)
        link.classList.add('bn'); // Add the custom class for styling
        
        const textDiv = document.createElement('div');
        textDiv.classList.add('text');
        textDiv.textContent = data.text;
        link.appendChild(textDiv); // Append textDiv to the link element
    
        const imgDiv = document.createElement('div');
        imgDiv.classList.add('img', 'bn');
        const img = document.createElement('img');
        img.src = data.imgPlaceholder;
        img.alt = 'Image Placeholder';
        imgDiv.appendChild(img);
        link.appendChild(imgDiv); // Append imgDiv to the link element
    
        card.appendChild(link); // Append the link element to the card
    
        cardsContainer.appendChild(card);
    });
    
    const title = document.createElement("h1");
    title.textContent = "Select Game Mode";
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
