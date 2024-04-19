async function logout() {
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
};
