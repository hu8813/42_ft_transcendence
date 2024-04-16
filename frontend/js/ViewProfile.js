async function fetchAndDisplayViewProfile(username) {
    console.log(username);
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`${getBackendURL()}/profiles/?username=${username}`, {
            headers: {
              'Authorization': `Bearer ${jwtToken}`
            }
        });
        if (response.ok) {
            
        const profileData = await response.json();
        if ('error' in profileData) {
            profileData = null; 
            window.location.href = "/#logout";
        }
        
        const user = profileData.user || {}; 
        const imageLink = user.image_link || '../src/emptyavatar.jpeg';
        const nickname = user.nickname || 'Not available';
        const login = user.login || 'Not available';
        const score = user.score || '0';

        
        document.querySelector('.profile-pic').src = imageLink;
        document.getElementById('nicknameadr').textContent = nickname;
        document.getElementById('nicknameadr2').textContent = login;
        document.getElementById('scoreadr').textContent = score;
        document.getElementById('addFriend').addEventListener('click', function() {
  
            console.log('Adding as friend...');
        });
        document.getElementById('viewScores').addEventListener('click', function() {
    
            console.log('Viewing recent scores...');
        });
    } else
    {
        throw new Error('Profile not found');
    }

    } catch (error) {
        console.error('Error fetching and displaying profile:', error);
        window.location.href = "/#logout";
    }
}
