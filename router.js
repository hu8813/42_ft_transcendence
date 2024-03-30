const routes = {
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
  "/logout": "/views/logout.html"
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
    default:
      break;
  }
};

handleLocation();

const navToggle = document.getElementById('nav-toggle');
const navMenu = document.querySelector('nav');

const toggleNavMenu = () => {
    navMenu.classList.toggle('active');
};

// Event listener for navigation toggle button
navToggle.addEventListener('click', toggleNavMenu);

// Function to handle navigation to a new page
const route = (event) => {
    //toggleNavMenu(); // Close the navigation menu
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
};

// Event listener for navigation to a new page
window.onpopstate = () => {
    //toggleNavMenu(); // Close the navigation menu
    handleLocation();
};
window.route = route;
