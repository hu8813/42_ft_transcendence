async function fetchAndDisplayViewProfile(username) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const csrfToken = await getCSRFCookie();

        const response = await fetch(`${getBackendURL()}/profiles/?username=${username}`, {
            headers: {
              'Authorization': `Bearer ${jwtToken}`,
              'X-CSRFToken': csrfToken
            }
        });
        if (response.ok) {
            
            const profileData = await response.json();
            if ('error' in profileData) {
                profileData = null; 
                window.location.href = "/";
            }
            
            const user = profileData.user || {}; 
            const imageLink = user.image_link || '../src/emptyavatar.jpeg';
            const nickname = user.nickname || 'Not available';
            const login = user.login || 'Not available';
            const score = user.score || '0';
            const isOnline = user.is_online || false;

            document.querySelector('.profile-pic').src = imageLink;
            document.getElementById('nicknameadr').textContent = nickname;
            document.getElementById('nicknameadr2').textContent = login;
            document.getElementById('scoreadr').textContent = score;
            
            // Update status indicator
            const statusIndicator = document.getElementById('statusIndicator');
            statusIndicator.classList.toggle('online', isOnline);
            statusIndicator.classList.toggle('offline', !isOnline);
            
            document.getElementById('addFriend').addEventListener('click', function() {
                console.log('Adding as friend...');
            });
            document.getElementById('viewScores').addEventListener('click', function() {
                console.log('Viewing recent scores...');
            });
        } else {
            throw new Error('Profile not found');
        }

    } catch (error) {
        console.error('Error fetching and displaying profile:', error);
        window.location.href = "/";
    }
}
