window.addEventListener('click', function(event) {
    const gameHistoryContainer = document.getElementById('gameHistory2');
    if (gameHistoryContainer && event.target !== gameHistoryContainer && !gameHistoryContainer.contains(event.target)) {
        gameHistoryContainer.style.display = 'none';
    }
});

// Function to close the game history container
function closeGameHistory() {
    const gameHistoryContainer = document.getElementById('gameHistory2');
    if (gameHistoryContainer) {
        gameHistoryContainer.style.display = 'none';
    }
}

async function fetchAndDisplayViewProfile(username) {
     
    try {
        let jwtToken = localStorage.getItem('jwtToken');
        let csrfToken = await getCSRFCookie();

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
            const score = user.score || '0';
            const isOnline = user.is_online || false;
            const gamesPlayed = user.games_played || '0';
            const winningRate = user.winning_rate || '0';

            document.querySelector('.profile-pic').src = imageLink;
            document.getElementById('nicknameadr2').textContent = nickname;
            document.getElementById('scoreadr').textContent = score;
            document.getElementById('gamesPlayed').textContent = gamesPlayed;
            document.getElementById('winningRate').textContent = winningRate;
            
            const statusIndicator = document.getElementById('statusIndicator');
            statusIndicator.classList.toggle('online', isOnline);
            statusIndicator.classList.toggle('offline', !isOnline);
            statusIndicator.title = isOnline ? 'Online' : 'Offline';
            
            document.getElementById('showGameHistoryBtn2').addEventListener('click', async function() {
                try {
                    const jwtToken = localStorage.getItem('jwtToken');
                    
                    const gameHistoryResponse = await fetch(`/api/fetch_game_history?username=${username}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
            
                    if (gameHistoryResponse.ok) {
                        const gameHistoryData = await gameHistoryResponse.json();
            
                        const gameHistoryContainer = document.getElementById('gameHistory2');
                        if (gameHistoryContainer){
                            gameHistoryContainer.style.display = 'flex'; // Change display to flex
                            gameHistoryContainer.innerHTML = '<button id="closeGameHistoryBtn" class="close-button" onclick="closeGameHistory()">Close</button>';
                        }
                        // Sort game history by date_time_played in descending order
                        gameHistoryData.sort((a, b) => new Date(b.date_time_played) - new Date(a.date_time_played));
            
                        gameHistoryData.forEach(game => {
                            const gameElement = document.createElement('div');
                            gameElement.classList.add('game-item', 'mb-3', 'border', 'border-primary', 'rounded', 'p-3');
                            gameElement.innerHTML = `
                                <div><strong>Opponent:</strong> ${game.opponent || 'cpu'}</div>
                                <div><strong>Game Type:</strong> ${game.game_type}</div>
                                <div><strong>Date Played:</strong> ${game.date_time_played}</div>
                                <div><strong>Result:</strong> 
                                    ${game.tournaments_won ? '<i class="bi bi-trophy-fill text-success fs-5"></i>' : '<i class="bi bi-emoji-frown-fill text-danger fs-5"></i>'}
                                </div>
                            `;
                            gameHistoryContainer.appendChild(gameElement);
                        });
                    } else {
                        throw new Error('Failed to fetch game history');
                    }
                } catch (error) {
                    displayErrorMessage(error.message);
                    console.error('Error fetching and displaying game history:', error);
                }
            });
            

            document.getElementById('addfriend').addEventListener('click', async function() {
                try {
                    let jwtToken = localStorage.getItem('jwtToken');
                    let csrfToken = await getCSRFCookie();

                    
                    const response = await fetch(`/api/add-friend?username=${username}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
                    
                    const responseData = await response.json();
                    if (response.ok) {
                        messageContainer.textContent = responseData.message;
                        messageContainer.style.color = 'green';
                    } else {
                        throw new Error('Failed to add friend '+responseData.message);
                    }
                } catch (error) {
                    console.error('Error adding friend:', error);
                    messageContainer.textContent = 'Opps '+error.message;
                    messageContainer.style.color = 'red';
                }
            });
            
            document.getElementById('blockuser').addEventListener('click', async function() {
                try {
                    let jwtToken = localStorage.getItem('jwtToken');
                    let csrfToken = await getCSRFCookie();

            
                    
                    const response = await fetch(`/api/block-user?username=${username}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
                    
                    const responseData = await response.json();
                    if (response.ok) {
                        messageContainer.textContent = responseData.message;
                        messageContainer.style.color = 'green';
                    } else {
                        throw new Error('Failed to block user '+responseData.message);
                    }
                } catch (error) {
                    console.error('Error blocking user:', error);
                    messageContainer.textContent = 'Opps '+error.message;
                    messageContainer.style.color = 'red';
                }
            });
            document.getElementById('removefriend').addEventListener('click', async function() {
                try {
                    let jwtToken = localStorage.getItem('jwtToken');
                    let csrfToken = await getCSRFCookie();

                    
                    
                    const response = await fetch(`/api/remove-friend?username=${username}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
                    
                    const responseData = await response.json();
                    if (response.ok) {
                        messageContainer.textContent = responseData.message;
                        messageContainer.style.color = 'green';
                    } else {
                        throw new Error('Failed to remove friend ' + responseData.message);
                    }
                } catch (error) {
                    console.error('Error removing friend:', error);
                    messageContainer.textContent = 'Opps '+error.message;
                    messageContainer.style.color = 'red';
                }
            });
            
            document.getElementById('unblockuser').addEventListener('click', async function() {
                try {
                    let jwtToken = localStorage.getItem('jwtToken');
                    let csrfToken = await getCSRFCookie();

                    
                    
                    const response = await fetch(`/api/unblock-user?username=${username}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwtToken}`,
                            'X-CSRFToken': csrfToken
                        }
                    });
                    
                    const responseData = await response.json();
                    if (response.ok) {
                        messageContainer.textContent = responseData.message;
                        messageContainer.style.color = 'green';
                    } else {
                        throw new Error('Failed to unblock user '+responseData.message);
                    }
                } catch (error) {
                    console.error('Error unblocking user:', error);
                    messageContainer.textContent = 'Opps '+error.message;
                    messageContainer.style.color = 'red';
                }
            });
            
        } else {
            throw new Error('Profile not found');
        }

    } catch (error) {
        console.error('Error fetching and displaying profile:', error);
        const messageContainer = document.getElementById('messageContainer');
        if (messageContainer)
            {
                messageContainer.textContent = error.message;
        messageContainer.style.color = 'red';
            }
        //window.location.href = "/";
    }
}
