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
  "#playersremote2": "/views/playersremote2.html"
};

let translationsCache = {}; // Global translation cache
let currentLanguage = 'en'; 
updateNavigation();

function changeLanguage(languageCode) {
  currentLanguage = languageCode; 
  translationsCache = {}; // Reset the cache to an empty object
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

// Update navigation and fetch translations for the current language at the beginning
async function initialize() {
  updateNavigation();
  await fetchAndCacheTranslations(currentLanguage);
}

// Function to change the current language and fetch translations for the new language
async function changeLanguage(languageCode) {
  currentLanguage = languageCode; 
  translationsCache = {}; // Reset the cache to an empty object
  await fetchAndCacheTranslations(currentLanguage);
  translate(currentLanguage); 
}

// Function to translate a key using the translations cache
function translateKey(key) {
  const lang = currentLanguage;

  return new Promise((resolve, reject) => {
    // Check if translations for the current language are available in the cache
    if (translationsCache[lang]) {
      const translations = translationsCache[lang];
  
      // Split the key into parts based on '.'
      const keyParts = key.split('.');
  
      // Iterate over the key parts to access nested translations
      let translation = translations;
      for (const part of keyParts) {
        if (translation && translation[part]) {
          translation = translation[part];
        } else {
          // If any part of the key is not found, reject the promise
          reject(new Error(`Translation for key '${key}' not found`));
          return;
        }
      }
  
      // Resolve the promise with the translation
      resolve(translation);
    } else {
      // If translations for the current language are not available in the cache, reject the promise
      reject(new Error(`Translations for language '${lang}' not found in the cache`));
    }
  });
}

// Call the initialize function to set up the application
initialize();




const handleLocation = async () => {
  const path = window.location.hash || '#'; // Use window.location.hash to get the fragment identifier
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
      // Handle '/#pongehab' case if needed
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
    //navMenu.classList.remove('active'); // Remove the 'active' class if it exists
    
} else {
    navMenu.classList.add('active'); // Add the 'active' class if it doesn't exist

}
};

// Event listener for navigation toggle button
navToggle.addEventListener('click', toggleNavMenu);

// Function to handle navigation to a new page
const route = (event) => {
    event = event || window.event;
    event.preventDefault();
    //navToggle.click();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};

// Event listener for navigation to a new page
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
