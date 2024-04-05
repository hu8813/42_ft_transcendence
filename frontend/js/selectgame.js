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
            text: "Tic Tac toe",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#xoxo",
        },
        {
            text: "Tic Tac toe",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#xoxo",
        },
        {
            text: "Tic Tac toe",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#xoxo",
        },
        {
            text: "Tic Tac toe",
            imgPlaceholder: './src/multiplayer.jpeg',
            href: "#xoxo",
        },
        
    ];

    const container = document.querySelector('.gameModes');
    const cardsContainer = document.createElement('div');

    cardsData.forEach(data => {
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
    cardsContainer.style.gridTemplateColumns = "repeat(3, 2fr)";
    cardsContainer.style.gap = "20px";
    cardsContainer.style.padding = "0px 10px";
}
