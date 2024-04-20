async function fetchAndDisplayViewProfile(username) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const csrfToken = await getCSRFCookie();

        const response = await fetch(`/api/profiles/?username=${username}`, {
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
            
            const statusIndicator = document.getElementById('statusIndicator');
            statusIndicator.classList.toggle('online', isOnline);
            statusIndicator.classList.toggle('offline', !isOnline);
            statusIndicator.title = isOnline ? 'Online' : 'Offline';
            
            document.getElementById('addFriend').addEventListener('click', async function() {
                try {
                    const jwtToken = localStorage.getItem('jwtToken');
                    const csrfToken = await getCSRFCookie();
                    
                    const username = document.getElementById('nicknameadr2').textContent;
                    
                    const response = await fetch(`/api/add-friend?username=${username}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
                    
                    if (response.ok) {
                        const responseData = await response.json();
                        alert(responseData.message);
                    } else {
                        throw new Error('Failed to add friend');
                    }
                } catch (error) {
                    console.error('Error adding friend:', error);
                    alert('Failed to add friend');
                }
            });
            
            document.getElementById('blockUser').addEventListener('click', async function() {
                try {
                    const jwtToken = localStorage.getItem('jwtToken');
                    const csrfToken = await getCSRFCookie();
                    
                    const username = document.getElementById('nicknameadr2').textContent;
                    
                    const response = await fetch(`/api/block-user?username=${username}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
                    
                    if (response.ok) {
                        const responseData = await response.json();
                        alert(responseData.message);
                    } else {
                        throw new Error('Failed to block user');
                    }
                } catch (error) {
                    console.error('Error blocking user:', error);
                    alert('Failed to block user');
                }
            });
            document.getElementById('removeFriend').addEventListener('click', async function() {
                try {
                    const jwtToken = localStorage.getItem('jwtToken');
                    const csrfToken = await getCSRFCookie();
                    
                    const username = document.getElementById('nicknameadr2').textContent;
                    
                    const response = await fetch(`/api/remove-friend?username=${username}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
                    
                    if (response.ok) {
                        const responseData = await response.json();
                        alert(responseData.message);
                    } else {
                        throw new Error('Failed to remove friend');
                    }
                } catch (error) {
                    console.error('Error removing friend:', error);
                    alert('Failed to remove friend');
                }
            });
            
            document.getElementById('unblockUser').addEventListener('click', async function() {
                try {
                    const jwtToken = localStorage.getItem('jwtToken');
                    const csrfToken = await getCSRFCookie();
                    
                    const username = document.getElementById('nicknameadr2').textContent;
                    
                    const response = await fetch(`/api/unblock-user?username=${username}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
                    
                    if (response.ok) {
                        const responseData = await response.json();
                        alert(responseData.message);
                    } else {
                        throw new Error('Failed to unblock user');
                    }
                } catch (error) {
                    console.error('Error unblocking user:', error);
                    alert('Failed to unblock user');
                }
            });
            
        } else {
            throw new Error('Profile not found');
        }

    } catch (error) {
        console.error('Error fetching and displaying profile:', error);
        window.location.href = "/";
    }
}
