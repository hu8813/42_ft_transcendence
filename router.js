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

const route = (event) => {
  event = event || window.event;
  event.preventDefault();
  window.history.pushState({}, "", event.target.href);
  handleLocation();
};

window.onpopstate = handleLocation;
window.route = route;
