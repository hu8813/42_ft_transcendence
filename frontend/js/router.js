const routes = {
  '*': '/views/home.html',
  404: "/views/404.html",
  "#": "/views/home.html",
  "#home": "/views/home.html",
  "#login": "/views/login.html",
  "#register": "/views/register.html",
  "#play!": "/views/selectgame.html",
  "#chat": "/views/chat.html",
  "#leaderboard": "/views/leaderboard.html",
  "#profile": "/views/profile.html",
  "#privacy-policy": "/views/privacy.html",
  "#contact": "/views/contact.html",
  "#return": "/views/return.html",
  "#logout": "/views/logout.html",
  "#pongehab": "/views/pongehab.html",
  "#ponggame": "/views/ponggame.html",
  "#player3d1": "/views/player3d1.html",
  "#playerai1": "/views/playerai1.html",
  "#playersremote2": "/views/playersremote2.html",
  "#aboutus": "/views/aboutus.html",
  "#pong3": "/views/pong3.html",
};

let translationsCache = {}; 
let currentLanguage = '';

if (!currentLanguage) {
    currentLanguage = 'en';
}
const currentURL = window.location.href;
let backendURL = "";
const privateIPRegex = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
if (currentURL.includes("localhost") || currentURL.includes("127.0.0.1")) {
    backendURL = "http://localhost:8000";
    backendSigninURL = "http://localhost:8000/api/signin42c/";
} else if (privateIPRegex.test(currentURL)) {
    backendURL = "http://localhost:8000";
    backendSigninURL = "http://localhost:8000/api/signin42c/"; 
} else {
    backendURL = "https://pong42.azurewebsites.net";
    backendSigninURL = "https://pong42.azurewebsites.net/api/signin42b/";
}

console.log("Backend URL:", backendURL);

updateNavigation();

function changeLanguage(languageCode) {
  currentLanguage = languageCode; 
  translationsCache = {}; 
  translate(currentLanguage); 
}

async function fetchAndCacheTranslations(language) {
  try {
    const response = await fetch(`translations/${language}.json`);
    const translations = await response.json();
    translationsCache[language] = translations;
  } catch (error) {
    console.error(`Error fetching translations for language '${language}':`, error);
  }
}


async function initialize() {
  updateNavigation();
  await fetchAndCacheTranslations(currentLanguage);
}


async function changeLanguage(languageCode) {
  currentLanguage = languageCode; 
  translationsCache = {}; 
  await fetchAndCacheTranslations(currentLanguage);
  translate(currentLanguage); 
}


function translateKey(key) {
  const lang = currentLanguage;

  return new Promise((resolve, reject) => {
    
    if (translationsCache[lang]) {
      const translations = translationsCache[lang];
  
      
      const keyParts = key.split('.');
  
      
      let translation = translations;
      for (const part of keyParts) {
        if (translation && translation[part]) {
          translation = translation[part];
        } else {
          
          reject(new Error(`Translation for key '${key}' not found`));
          return;
        }
      }
  
      
      resolve(translation);
    } else {
      
      reject(new Error(`Translations for language '${lang}' not found in the cache`));
    }
  });
}


initialize();



const handleLocation = async () => {
  let path = window.location.hash || '#'; 
  const questionMarkIndex = path.indexOf('?');
  if (questionMarkIndex !== -1) {
    path = path.slice(0, questionMarkIndex);
  }
  console.log("path:" + path);
  const route = routes[path] || routes[404];
  const html = await fetch(route).then((data) => data.text());
  document.getElementById("app").innerHTML = html;

  if (localStorage.getItem("isLoggedIn") === "true") {
    if (!leaderboardData || leaderboardData.length === 0) {
      await fetchLeaderboardData();
    }
  }
  
  switch(path) {
    case "#profile":
      if (localStorage.getItem("isLoggedIn") === "true") {
          fetchAndDisplayProfile();
      }
      break;
    case "#leaderboard":
      if (localStorage.getItem("isLoggedIn") === "true") {
        if (!leaderboardData || leaderboardData.length === 0) {
          await fetchLeaderboardData();          
        }
        displayLeaderboard();
      }
      break;
    case "#logout":
      logout();
      break;
    case "#chat":
      openChat();
      break;
    case "#pongehab":
      showPongEhab();
      break;
    case "#ponggame":
      showPongGamePage();
      break;
    case "#playersremote2":
      showPlayersRemote2();
        break;
    case "#playerai1":
      showPlayerAi1Page();
      break;
    case "#player3d1":
      showPlayer3d1Page();
      break;
    case "#aboutus":
      showAboutUsPage();
      break;
    case '#play!':
      showGameModes();
      break;
    case '#pong3':
      showPong3();
      break;
    default:
      break;
  }
};

handleLocation();


const navToggle = document.getElementById('nav-toggle');
const navMenu = document.querySelector('nav');

const toggleNavMenu = () => {
  if (navMenu.classList.contains('active')) {
    //navMenu.classList.remove('active'); 
    
} else {
    navMenu.classList.add('active'); 

}
};


navToggle.addEventListener('click', toggleNavMenu);


const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    //navToggle.click();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};


window.onpopstate = () => {

    handleLocation();
    //navToggle.click();
    

};


function translate(lang) {

  fetch(`translations/${lang}.json`)
    .then(response => response.json())
    .then(translations => {

      Object.keys(translations).forEach(category => {
        Object.keys(translations[category]).forEach(key => {
          const element = document.getElementById(key);
          if (element) {
            element.innerHTML = translations[category][key];
          }
        });
      });
    })
    .catch(error => console.error('Error fetching translations:', error));
}


translate(currentLanguage);


function updateNavigation() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  const navMenu = document.getElementById('nav-menu');
  navMenu.innerHTML = ''; 
  //navMenu.style.display = 'block';



  const menuItems = isLoggedIn ?
    ['Play!', 'Chat', 'Leaderboard', 'Profile', 'Logout'] :
    ['Home', 'Login'];


  menuItems.forEach(item => {
const li = document.createElement('li');
const a = document.createElement('a');
a.classList.add('nav-item');
a.href = `/#${item.toLowerCase()}`;
a.id = `${item.toLowerCase()}title`;
a.textContent = item;

a.onclick = (event) => route(event, a.href); 
li.appendChild(a);
navMenu.appendChild(li);
});


}


window.addEventListener('load', () => {
  if (localStorage.getItem('isLoggedIn') === null) {
    localStorage.setItem('isLoggedIn', 'false');
  }
  updateNavigation();
});

window.route = route;
