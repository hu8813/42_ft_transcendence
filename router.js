// an object to hold the routes
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
  //   get current path name
  const route = routes[path] || routes[404];
  //   get the route from the routes object or the 404 route
  const html = await fetch(route).then((data) => data.text());
  // fetch current path view html
  document.getElementById("app").innerHTML = html;
  if (path === "/profile") {
    fetchAndDisplayProfile();
  }
  else if (path === "/leaderboard") {
    fetchAndDisplayLeaderboard();
  }
  //   change view_container html to the fetched view html
};

handleLocation();
// call handleLocation function

const route = (event) => {
  event = event || window.event;
  //  get the event object
  event.preventDefault();
  //  prevent default behaviour
  window.history.pushState({}, "", event.target.href);
  //   change the url to the target href
  handleLocation();
  //   call handleLocation function
};
window.onpopstate = handleLocation;
//   listen for popstate event
window.route = route;
