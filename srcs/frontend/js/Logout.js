function logout() {
    let tmplanguage = localStorage.getItem('language');
    localStorage.clear();
    localStorage.setItem('language', tmplanguage);
    window.location.href = '/'; 
};