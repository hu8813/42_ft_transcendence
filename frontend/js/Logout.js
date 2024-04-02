function logout() {
    localStorage.setItem("isLoggedIn", "false");
    window.location.href = '/'; 
};