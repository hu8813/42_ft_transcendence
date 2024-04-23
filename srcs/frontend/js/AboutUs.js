function showAboutUsPage() {
  const cardsData = [
    {
      imgSrc: 'src/ddyankov.jpg',
      imgAlt: 'ddyankov',
      firstName: 'Deyan',
      lastName: 'Dyankov',
      githubLink: 'https://github.com/ddyankov28',
      linkedinLink: 'https://www.linkedin.com/in/ddyankov23/'
    },
    {
      imgSrc: 'src/eelasam.jpg',
      imgAlt: 'eelasam',
      firstName: 'Ehab',
      lastName: 'Elasam',
      githubLink: 'https://github.com/EhabElasam',
      linkedinLink: 'https://www.linkedin.com/in/ehab-elasam/'
    },
    {
      imgSrc: 'src/huaydin.jpg',
      imgAlt: 'huaydin',
      firstName: 'Hüseyin Kaya',
      lastName: 'Aydin',
      githubLink: 'https://github.com/hu8813/',
      linkedinLink: 'https://www.linkedin.com/in/huaydin/'
    },    
    {
      imgSrc: 'src/vstockma.jpg',
      imgAlt: 'vstockma',
      firstName: 'Valentin',
      lastName: 'Stockmayer',
      githubLink: 'https://github.com/vstockma',
      linkedinLink: 'https://www.linkedin.com/in/valentin-stockmayer-461b821a4/'
    }

  ];

  const fragment = document.createDocumentFragment();

  cardsData.forEach(data => {
    const card = document.createElement('li');
    card.classList.add('aucard', 'bn');

    const imgDiv = document.createElement('div');
    imgDiv.classList.add('img');
    const img = document.createElement('img');
    img.src = data.imgSrc;
    img.alt = data.imgAlt;
    imgDiv.appendChild(img);
    card.appendChild(imgDiv);

    
    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name');
    
    const firstNameDiv = document.createElement('div');
    firstNameDiv.textContent = data.firstName;
    nameDiv.appendChild(firstNameDiv);

    const lastNameDiv = document.createElement('div');
    lastNameDiv.textContent = data.lastName;
    nameDiv.appendChild(lastNameDiv);

    card.appendChild(nameDiv);

    
    const iconDiv = document.createElement('div');
    iconDiv.classList.add('icon-container');

    const githubBtn = document.createElement('button');
    githubBtn.classList.add('icon');
    const githubIcon = document.createElement('i');
    githubIcon.classList.add('bi', 'bi-github');
    githubBtn.appendChild(githubIcon);
    githubBtn.addEventListener('click', () => {
      window.open(data.githubLink, '_blank');
    });
    iconDiv.appendChild(githubBtn);

    const linkedinBtn = document.createElement('button');
    linkedinBtn.classList.add('icon');
    const linkedinIcon = document.createElement('i');
    linkedinIcon.classList.add('bi', 'bi-linkedin');
    linkedinBtn.appendChild(linkedinIcon);
    linkedinBtn.addEventListener('click', () => {
      window.open(data.linkedinLink, '_blank');
    });
    iconDiv.appendChild(linkedinBtn);

    card.appendChild(iconDiv);

    fragment.appendChild(card);
  });

  const wrapper = document.querySelector('.wrapperaboutus');
  const title = document.createElement("h1");
  translateKey('ourTeam').then(ourTeamTranslation => {
    title.innerHTML = `<span id="ourTeam">${ourTeamTranslation}</span>`;
});
if (wrapper)
{
    wrapper.appendChild(title);
  const carousel = document.createElement('ul');
  carousel.classList.add('carouselaboutus');
  carousel.appendChild(fragment);


  wrapper.appendChild(carousel);
}
//translate(currentLanguage);
}
