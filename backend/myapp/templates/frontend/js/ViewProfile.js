async function fetchAndDisplayViewProfile(username) {
    console.log(username);
    try {
        const response = await fetch(`${getBackendURL()}/profiles/?username=${username}`);
        if (!response.ok) {
            throw new Error('Profile not found');
        }

        const profileData = await response.json();

        
        const user = profileData.user || {}; 
        const imageLink = user.image_link || './static/src/emptyavatar.jpeg';
        const nickname = user.nickname || 'Not available';
        const login = user.login || 'Not available';
        const score = user.score || '0';

        
        document.querySelector('.profile-pic').src = imageLink;
        document.getElementById('nicknameadr').textContent = nickname;
        document.getElementById('nicknameadr2').textContent = login;
        document.getElementById('scoreadr').textContent = score;
    } catch (error) {
        console.error('Error fetching and displaying profile:', error);
        
    }
}
