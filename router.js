const routes = {
  '*': '/views/home.html',
  404: "/views/404.html",
  "/": "/views/home.html",
  "/home": "/views/home.html",
  "/login": "/views/login.html",
  "/register": "/views/register.html",
  "/play!": "/views/selectgame.html",
  "/chat": "/views/chat.html",
  "/leaderboard": "/views/leaderboard.html",
  "/profile": "/views/profile.html",
  "/privacy-policy": "/views/privacy.html",
  "/contact": "/views/contact.html",
  "/return": "/views/return.html",
  "/logout": "/views/logout.html",
  "/pongehab": "/views/pongehab.html",
  "/ponggame": "/views/ponggame.html",
  "/player3d1": "/views/player3d1.html",
  "/playerai1": "/views/playerai1.html",
  "/playersremote2": "/views/playersremote2.html"
};

const handleLocation = async () => {
  const path = window.location.pathname;
  const route = routes[path] || routes[404];
  const html = await fetch(route).then((data) => data.text());
  document.getElementById("app").innerHTML = html;

  if (localStorage.getItem("isLoggedIn") === "true") {
    if (!leaderboardData || leaderboardData.length === 0) {
      await fetchLeaderboardData();
    }
  }

  switch(path) {
    case "/profile":
      if (localStorage.getItem("isLoggedIn") === "true") {
          fetchAndDisplayProfile();
      }
      
      break;
    case "/leaderboard":
      if (localStorage.getItem("isLoggedIn") === "true") {
        if (!leaderboardData || leaderboardData.length === 0) {
          await fetchLeaderboardData();          
        }
        displayLeaderboard();
      }
      
      break;
    case "/logout":
      logout();
      break;
    case "/pongehab":
        
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
window.route = route;
