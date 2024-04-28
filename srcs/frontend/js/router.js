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
  "#pong4": "/views/pong4.html",
  "#tic1": "/views/tic1.html",
  "#tic2": "/views/tic2.html",
  "#tournament": "/views/tournament.html",
  "#tournament2": "/views/tournament2.html",
  "#tournaments": "/views/alltournaments.html",
  "#viewprofile": "/views/viewprofile.html",
  "#rps" : "/views/rps.html",
  "#chatselect" : "/views/chatselect.html",
  "#manage2fa" : "/views/manage2fa.html",
};


let msgReg ;
const hashParamsString2 = window.location.hash.substring(1); // Remove the leading #
const paramsIndex2 = hashParamsString2.indexOf('?');

if (paramsIndex2 !== -1) {
    const paramsString2 = hashParamsString2.substring(paramsIndex2 + 1);
    const hashParams = new URLSearchParams(paramsString2);

    if (hashParams && hashParams.has('m')) {
        msgReg = hashParams.get('m');
    }
}

let csrfToken;


function getBackendSigninURL() {
  const currentURL = new URL(window.location.href);
  const referralURL = encodeURIComponent(currentURL.origin);
  let backendSigninURL = `/api/signin42c/?referral_url=${referralURL}`;
  
return backendSigninURL;
}


function showPopup() {
  feedbackPopup = document.getElementById("feedback-popup");
  if (feedbackPopup) {
    feedbackPopup.style.display = "block";
  }
  
  if (window.innerWidth <= 768) {
    closePopup();
  }
}


function closePopup() {
  feedbackPopup = document.getElementById("feedback-popup");
  if (feedbackPopup) {
    feedbackPopup.style.display = "none";
  }
}
//showPopup();
const csrfCookieName = 'csrftoken';
let userNickname = localStorage.getItem('userNickname');
function setCSRFCookie(csrfToken) {
  document.cookie = `${csrfCookieName}=${csrfToken}; path=/`;
}

async function getCSRFCookie() {
  let csrfCookie = getCookie(csrfCookieName);
  

      try {
          const response = await fetch('/api/get-csrf-token/', {
              method: 'GET',
              credentials: 'same-origin'
          });
          if (!response.ok) {
              throw new Error('Failed to fetch CSRF token');
          }
          const data = await response.json();
          csrfToken = data.csrfToken;
          if (csrfToken) {
              document.cookie = `${csrfCookieName}=${csrfToken}; path=/`;
              return csrfToken;
          }
      } catch (error) {
          console.error('Error fetching CSRF token:', error);
          return null;
      }
  
}


function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
          return cookieValue;
      }
  }
  return null;
}

getCSRFCookie();

(async function() {
  let csrfToken = await getCSRFCookie();
})();
let translationsCache = {}; 
let currentLanguage = localStorage.getItem('language');
if (!currentLanguage) {
  const userLanguage = navigator.language.toLowerCase();
  if (userLanguage.startsWith('en')) {
    currentLanguage = 'en';
  } else if (userLanguage.startsWith('de') || userLanguage.startsWith('at') || userLanguage.startsWith('ch')) {
    currentLanguage = 'at';
  } else if (userLanguage.startsWith('tr')) {
    currentLanguage = 'tr';
  } else if (userLanguage.startsWith('bg')) {
    currentLanguage = 'bg';
  } else if (userLanguage.startsWith('fr')) {
    currentLanguage = 'fr';
  } else if (userLanguage.startsWith('ar')) {
    currentLanguage = 'eg';
  } else if (userLanguage.startsWith('es')) {
    currentLanguage = 'es';
  } else if (userLanguage.startsWith('it')) {
    currentLanguage = 'it';
  } else if (userLanguage.startsWith('ua')) {
    currentLanguage = 'ua';
  } else if (userLanguage.startsWith('ru')) {
    currentLanguage = 'ru';
  } else if (userLanguage.startsWith('pt')) {
    currentLanguage = 'pt';
  } else if (userLanguage.startsWith('zh')) {
    currentLanguage = 'zh';
  } else {
    currentLanguage = 'en';
  }
  localStorage.setItem('language', currentLanguage);
}





const apiUrl = `/api/messages`;
const signinUrl = `/api/signin42c/`;



updateNavigation();



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
  localStorage.setItem('language', languageCode);
  translationsCache = {};
  await fetchAndCacheTranslations(languageCode);
  translate(languageCode);
  location.reload();
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
          
          return;
        }
      }

      resolve(translation);
    } else {
      
      return;
    }
  });
}


initialize();
async function cleanLogout() {
  try {
      const jwtToken = localStorage.getItem('jwtToken');
      const csrfToken = await getCSRFCookie();

      const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${jwtToken}`,
              'X-CSRFToken': csrfToken
          }
      });

      const tmplanguage = localStorage.getItem('language');
      localStorage.clear();
      localStorage.setItem('language', tmplanguage);
      //window.location.href = '/';
  } catch (error) {
      console.error('Error logging out:', error);
      
      const tmplanguage = localStorage.getItem('language');
      localStorage.clear();
      localStorage.setItem('language', tmplanguage);
      //window.location.href = '/';
  }
  location.reload();
};

function doLogout (){
  const language = localStorage.getItem("language");
  localStorage.clear(); 
  if (language) {
    localStorage.setItem("language", language);
  }

  setTimeout(() => {
    window.location.href = "/"; 
}, 1000);
};

const handleLocation = async () => {
  let path = window.location.hash || '#'; 
  const questionMarkIndex = path.indexOf('?');
  if (questionMarkIndex !== -1) {
    path = path.slice(0, questionMarkIndex);
  }
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
    
    case "#viewprofile":
    const hashParamsString = window.location.hash.substring(1);
    const paramsIndex = hashParamsString.indexOf('?');
    if (paramsIndex !== -1) {
        const paramsString = hashParamsString.substring(paramsIndex + 1);
        const hashParams = new URLSearchParams(paramsString);

        if (hashParams && hashParams.has('u')) {
            const username = hashParams.get('u');
            if (username) {
                await fetchAndDisplayViewProfile(username);
            } else {
                
            }
        } else {
            console.error("No 'u' parameter found in the URL.");
            
        }
    } else {
        console.error("No parameters found in the URL.");
        
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
      cleanLogout();
      break;
    case "#chat":
      openChat();
      break;
    case '#chatselect':
      chatSelect();
      break;
    case "#":
    case "#home":
      showHome();
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
    case '#register':
      handleRegister();
      break;
    case '#pong3':
      showPong3();
      break;
    case '#pong4':
      showPong4();
      break;
    case '#tic1':
      showTic1();
      break;
    case '#login':
      
          await handleLogin(msgReg);
          
        break;
    case '#tic2':
      showTic2();
      break;
    case '#tournaments':
      allTournaments();
      break;
    case '#tournament':
      // const tournamentHtml = await fetch(routes[path]).then((data) => data.text());
      // document.getElementById("app").innerHTML = tournamentHtml;
      // askPlayerCount();
      showTournamentPage();
      break;
    case '#tournament2':
      showTournamentTicPage();
      break;
    case '#contact':
      showImprint();
      break;
    case '#privacy-policy':
      showPrivacyPolicy();
      break;
    case '#rps':
      playRPS();
      break;
    
    case '#manage2fa':
      display2faPage();
      break;
    default:
      translate(currentLanguage);
      break;
  }
  translate(currentLanguage);
};

window.addEventListener('hashchange', handleLocation);
handleLocation();

let chatChannel;
if (!chatChannel) {
  chatChannel = "#General";
}
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.querySelector('nav');

const showNavMenu = () => {
  navMenu.style.display = 'block';
};


const hideNavMenu = () => {
  navMenu.style.display = 'none';
};




const toggleNavMenu = () => {
  if (navMenu.style.display === 'none' || navMenu.style.display === '') {
    showNavMenu();
  } else {
    hideNavMenu();
  }
};


navToggle.addEventListener('click', toggleNavMenu);

const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};


window.onpopstate = () => {
    handleLocation();
    showNavMenu();
};



function translate(lang) {
  let currentLanguagetmp = localStorage.getItem('language');
  if (!currentLanguagetmp) {
    currentLanguagetmp = lang || 'en';
    localStorage.setItem('language', currentLanguagetmp);
    currentLanguage = currentLanguagetmp;
  }

  fetch(`translations/${lang}.json`)
    .then(response => response.json())
    .then(translations => {
      Object.keys(translations).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          element.innerHTML = translations[key];
        }
      });
    })
    .catch(error => console.error('Error fetching translations:', error));
}



translate(currentLanguage);


function updateNavigation() {
  let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const jwtToken = localStorage.getItem('jwtToken');
  let checkisLoggedIn = jwtToken !== null;
  if (!checkisLoggedIn) {
    let langtmp = localStorage.getItem('language');
    localStorage.clear();
    localStorage.setItem('language', langtmp);
    isLoggedIn = false;
    window.location.href = '/#login'; 
  }
  const navMenu = document.getElementById('nav-menu');
  navMenu.innerHTML = ''; 
  //navMenu.style.display = 'block';



  const menuItems = isLoggedIn || localStorage.getItem('isLoggedIn') === 'true' ?
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

const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = currentLanguage;
    }

window.addEventListener('load', () => {
  if (localStorage.getItem('isLoggedIn') === null) {
    let langtmp2 = localStorage.getItem('language');
    localStorage.clear();
    localStorage.setItem('language', langtmp2);
  }
  updateNavigation();
});

window.addEventListener('resize', () => {
  if (window.innerWidth >= 800) {
    
    showNavMenu();
  } else {
    
    hideNavMenu();
  }
});


window.route = route;
