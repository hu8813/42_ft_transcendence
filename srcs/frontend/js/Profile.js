function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
        errorMessageElement.style.color = 'red';
        errorMessageElement.style.fontSize = '0.6em';
    }
}
async function showGameHistory2() {
    window.addEventListener('click', function(event) {
        const gameHistoryContainer = document.getElementById('gameHistory');
        if (gameHistoryContainer && event.target !== gameHistoryContainer && !gameHistoryContainer.contains(event.target)) {
            gameHistoryContainer.style.display = 'none';
        }
    });
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        
        const gameHistoryResponse = await fetch(`/api/fetch_game_history`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            }
        });

        if (gameHistoryResponse.ok) {
            const gameHistoryData = await gameHistoryResponse.json();

            let cls = await translateKey("cls");
            const gameHistoryContainer = document.getElementById('gameHistory');
            if (gameHistoryContainer){
                gameHistoryContainer.style.display = 'flex'; 
                gameHistoryContainer.innerHTML = '<button id="closeGameHistoryBtn" class="close-button" onclick="closeGameHistory2()">'+cls+'</button>';
            }
            if (gameHistoryData.length === 0) {
                let emptyGameHistory = await translateKey("emptyGameHistory");
                gameHistoryContainer.innerHTML += `<div class="mb-3"><br/> `+ emptyGameHistory +` </div>`;
            } else {
                gameHistoryData.sort((a, b) => new Date(b.date_time_played) - new Date(a.date_time_played));

                let op = await translateKey("op");
                let gm = await translateKey("gm");
                let dt = await translateKey("dt");
                let res = await translateKey("res");

                gameHistoryData.forEach(game => {
                    const gameElement = document.createElement('div');
                    gameElement.classList.add('game-item', 'mb-3', 'border', 'border-primary', 'rounded', 'p-3');
                    gameElement.innerHTML = `
                        <div><strong>`+op+`:</strong> ${game.opponent || 'cpu'}</div>
                        <div><strong>`+gm+`:</strong> ${game.game_type}</div>
                        <div><strong>`+dt+`:</strong> ${game.date_time_played}</div>
                        <div><strong>`+res+`:</strong> 
                            ${game.tournaments_won ? '<i class="bi bi-trophy-fill text-success fs-5"></i>' : '<i class="bi bi-emoji-frown-fill text-danger fs-5"></i>'}
                        </div>
                    `;
                    gameHistoryContainer.appendChild(gameElement);
                });
            }
        } else {
            throw new Error('Failed to fetch game history');
        }
    } catch (error) {
        displayErrorMessage(error.message);
        console.error('Error fetching and displaying game history:', error);
    }
}


function isLocalDeployment() {
    return window.location.href.includes("pong42");
}

async function uploadImage(imageFile) {
    try {
        if (!imageFile.type.startsWith('image/')) {
            throw new Error('Only image files are accepted');
        }
        const maxSize = 5 * 1024 * 1024; 
        if (imageFile.size > maxSize) {
            throw new Error('Image size exceeds the maximum allowed limit (5MB)');
        }

        if (isLocalDeployment()) {
            alert("Image uploads are only supported on local deployments. They are not supported on Azure (yet).");
        }

        const jwtToken = localStorage.getItem('jwtToken');
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`/api/upload-avatar/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const responseData = await response.json();
        return responseData.image_link;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
}


async function fetchProfileData() {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/manage-profile/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            }
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('Profile not found');
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
        throw new Error('Failed to fetch profile data');
    }
}
function closeGameHistory2() {
    const gameHistoryContainer = document.getElementById('gameHistory');
    if (gameHistoryContainer) {
        gameHistoryContainer.style.display = 'none';
    }
}

async function selectAvatar(imageLink) {
    try {
       
        const jwtToken = localStorage.getItem('jwtToken');
        const formData = new FormData();
        
        formData.append('image_link', imageLink);
        const response = await fetch(`/api/manage-profile/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const profilePicElement = document.querySelector('.profile-pic');
        if (profilePicElement) {
            profilePicElement.src = imageLink;
        }
        const errorMessageElement = document.getElementById('errorMessage');   
        if (errorMessageElement) {
            errorMessageElement.textContent = 'Avatar changed successfully';
            errorMessageElement.style.color = 'green';
        }
        await fetchLeaderboardData();
    } catch (error) {
        console.error('Error updating profile:', error);
        if (response && response.message)
            displayErrorMessage(response.message);
        else
            displayErrorMessage(error.message);
        throw new Error('Failed to update profile');
    }
}


async function updateProfile(data) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const formData = new FormData();
        let res;
        if (data.nickname) {
            const maxNicknameLength = 20;
            if (data.nickname.length > maxNicknameLength) {
                displayErrorMessage(`Nickname exceeds the maximum allowed length of ${maxNicknameLength} characters.`);
                return;
                //throw new Error(`Nickname exceeds the maximum allowed length of ${maxNicknameLength} characters.`);
            }

            const nicknameRegex = /^[a-zA-Z0-9_-]+$/;
            if (!nicknameRegex.test(data.nickname)) {
                displayErrorMessage('Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.');
                return;
                //throw new Error('Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.');
            }
            //document.getElementById('playerProfileTtile').textContent = data.nickname;
            formData.append('nickname', data.nickname);
            
            //await updateOnlineUsers();
            await fetchLeaderboardData();
        }
        if (data.image_link) {
            formData.append('image_link', data.img_link);
        }

        if (data.image) {
            const imageFile = data.image;
            const imageLink = await uploadImage(imageFile);
            formData.append('image_link', imageLink);
            document.querySelector('.profile-pic').src = imageLink;
            document.getElementById('avatar0').src = imageLink;
            
        }

        const response = await fetch(`/api/manage-profile/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            },
            body: formData
        });
        if (!response.ok) {
            const errorData = await response.json(); 
            const errorMessage = errorData.error; 
            throw new Error('Failed to update profile: ' + errorMessage);
        }
        
        res = await response.json();
        localStorage.setItem('userNickname', data.nickname);
        userNickname = data.nickname;
        document.getElementById('nicknameadr').textContent = data.nickname;
        if (userNickname2)
            userNickname2 = data.nickname;
        if (document.getElementById('playerProfileTtile'))
            document.getElementById('playerProfileTtile').textContent = data.nickname;
        
        return res;
    } catch (error) {
        
        console.error('Error updating profile:', error);
        displayErrorMessage(error);
        //throw new Error('Failed to update profile');
    }
}

async function fetchAndDisplayFriends() {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/friends`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            }
        });

        if (response.ok) {
            const responseData = await response.json();
            const friends = responseData.friends;

            const friendListElement = document.querySelector('.friend-list');

            if (friendListElement) {
                friendListElement.innerHTML = '';
                
                friends.forEach(friend => {
                    const friendElement = document.createElement('div');
                    friendElement.classList.add('friend');
                    friendElement.style.marginBottom = '10px';

                    const statusIndicator = document.createElement('div');
                    statusIndicator.classList.add('status-indicator');
                    statusIndicator.style.backgroundColor = friend.status === 'online' ? 'green' : 'gray';
                    statusIndicator.title = friend.status === 'online' ? 'Online' : 'Offline';
                    friendElement.appendChild(statusIndicator);

                    const friendLink = document.createElement('a');
                    friendLink.href = `/#viewprofile?u=${friend.username}`;
                    friendLink.textContent = friend.nickname ;
                    friendLink.classList.add('bn');

                    const profileImage = document.createElement('img');
                    profileImage.src = friend.image_link ? friend.image_link : './src/emptyavatar.jpeg';
                    profileImage.alt = `${friend.username}'s profile image`;
                    profileImage.width = 50;
                    profileImage.height = 50;
                    profileImage.style.marginRight = '10px';
                    profileImage.classList.add('profile-image');
                    friendElement.appendChild(profileImage);
                    friendElement.appendChild(friendLink);
                    friendListElement.style.justifyContent = 'center';

                    friendListElement.appendChild(friendElement);
                });

            }
        } else {
            throw new Error('Failed to fetch friends');
        }
    } catch (error) {
        console.error('Error fetching and displaying friends:', error);
        if (response && response.message)
            displayErrorMessage(response.message);
    }
}

async function showAchievements() {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        
        const achievementsResponse = await fetch('/api/fetch_achievements', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            }
        });

        if (achievementsResponse.ok) {
            const achievementsData = await achievementsResponse.json();

            const gamesPlayed = achievementsData.games_played || 0;
            const gamesWon = achievementsData.games_won || 0;
            const winningRate = achievementsData.winning_rate || 0;

            const totalPlayedElement = document.getElementById('total-played');
            if (totalPlayedElement) {
                totalPlayedElement.textContent = `${gamesPlayed}`;
            }

            const winningRateElement = document.getElementById('winning-rate');
            if (winningRateElement) {
                winningRateElement.textContent = `${winningRate}%`;
            }

            const totalWonElement = document.getElementById('total-won');
            if (totalWonElement) {
                totalWonElement.textContent = `${gamesWon}`;
            }

            const totalLostElement = document.getElementById('total-lost');
            if (totalLostElement) {
                totalLostElement.textContent = `${achievementsData.games_lost || 0}`;
            }
        } else {
            const achievementsNotFound = await achievementsResponse.json();
            if (achievementsNotFound.error) {
                if (document.getElementById('total-played'))
                    document.getElementById('total-played').textContent = '0';
                if (document.getElementById('total-won'))
                    document.getElementById('total-won').textContent = '0';
                if (document.getElementById('total-lost'))
                    document.getElementById('total-lost').textContent = '0';
            } else {
                throw new Error('Failed to fetch achievements');
            }
        }
    } catch (error) {
        displayErrorMessage(error.message);
        console.error('Error fetching and displaying achievements:', error);
    }
}


async function deleteProfile() {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`/api/manage-profile/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            }
        });
        if (!response.ok) {
            displayErrorMessage('Failed to delete profile');
            throw new Error('Failed to delete profile');
        }
    } catch (error) {
        console.error('Error deleting profile:', error);
        if (response && response.message)
        displayErrorMessage(response.message);
        throw new Error('Failed to delete profile');
    }
}


async function fetchAndDisplayProfile() {
    const errorMessageElement = document.getElementById('errorMessage');
    csrfToken = await getCSRFCookie();
    updateNavigation() ;
    translate(currentLanguage);
    try {
        const profileData = await fetchProfileData();
        const user = profileData.user_info || {};
        const imageLink = (user.image_link && user.image_link.length >= 4) ? user.image_link : '../src/emptyavatar.jpeg';
        const nickname = user.userNickname || user.userLogin || 'Not available';
        const email = user.email || 'Not available';
        const score = user.score || 0;
        const csrfTokenNew = user.csrfToken || csrfToken;
        let isLoggedIn2;
        const gamesPlayed = user.games_played || 0;
        const gamesWon = user.games_won || 0;
        const winningRate = user.winning_rate || 0;

        if (localStorage.getItem('isLoggedIn') === 'true') {
            if (typeof isLoggedIn === 'undefined')
                isLoggedIn2 = true;
            else if (isLoggedIn === false)
                isLoggedIn2 = true;
        }
        if (csrfTokenNew)
            setCSRFCookie(csrfTokenNew);

        const profilePicElement = document.querySelector('.profile-pic');
        if (profilePicElement) {
            profilePicElement.src = imageLink;
        }

        const avatar0 = document.getElementById('avatar0');
        if (avatar0) {
            avatar0.src = imageLink;
        }   

        const nicknameElement = document.getElementById('nicknameadr');
        if (nicknameElement) {
            nicknameElement.textContent = nickname;
        }

        const emailElement = document.getElementById('emailadr');
        if (emailElement) {
            emailElement.textContent = email;
        }
        const scorelement = document.getElementById('scorerate');
        if (scorelement) {
            scorelement.textContent = score;
        }
        
        const totalPlayedElement = document.getElementById('total-played');
        if (totalPlayedElement) {
        totalPlayedElement.textContent = `${gamesPlayed}`;
        }

        const winningRateElement = document.getElementById('winning-rate');
        if (winningRateElement) {
        winningRateElement.textContent = `${winningRate}%`;
        }

        const totalWonElement = document.getElementById('total-won');
        if (totalWonElement) {
        totalWonElement.textContent = `${gamesWon}`;
        }

        const totalLostElement = document.getElementById('total-lost');
        if (totalLostElement) {
        totalLostElement.textContent = `${user.games_lost || 0}`;
        }
        if (document.getElementById('playerProfileTtile')) {
            document.getElementById('playerProfileTtile').textContent = nickname;
        }
        if (document.getElementById('changePhoto')) {
            document.getElementById('changePhoto').addEventListener('click', function () {
                document.getElementById('uploadPhoto').click();
            });
        }

        if (document.getElementById('uploadPhoto')) {
            document.getElementById('uploadPhoto').addEventListener('change', async function () {
                if (isLocalDeployment()) {
                    alert("Image uploads are only supported on local deployments. They are not supported on Azure (yet).");
                    return;
                }
                const imageFile = this.files[0];
                try {
                    const imageLink = await uploadImage(imageFile);
                    const timestamp = new Date().getTime();
                    const updatedImageLink = `${imageLink}?t=${timestamp}`;
                    document.querySelector('.profile-pic').src = updatedImageLink;
                    await fetchLeaderboardData();
                } catch (error) {
                    if (error.message)
                        displayErrorMessage(error.message);
                    console.error('Error updating profile photo:', error);
                }

            });
        }

        if (document.getElementById('changeNick')) {
            let newNick = await translateKey("newNick");
            document.getElementById('changeNick').addEventListener('click', async function () {
                const newNickname = prompt(newNick);
                if (newNickname !== null && newNickname.trim() !== "") {
                    try {
                        await updateProfile({ nickname: newNickname });
                        
                        // if (document.getElementById('nicknameadr'))
                        //     document.getElementById('nicknameadr').textContent = newNickname;
                        // if (document.getElementById('playerProfileTtile'))
                        //     document.getElementById('playerProfileTtile').textContent = newNickname;
                        // document.getElementById('nicknameadr').textContent = newNickname;
                    
                        // localStorage.setItem('userNickname', newNickname);
                        await fetchLeaderboardData();
                    } catch (error) {
                        if (error && error.message)
                            displayErrorMessage(error.message);
                        console.error('Error updating nickname:', error);
                    }
                }
            });
        }

        if (document.getElementById('deleteProfile')) {
            document.getElementById('deleteProfile').addEventListener('click', async function () {
                const confirmDelete = confirm("Are you sure you want to delete your profile?");
                if (confirmDelete) {
                    try {
                        await deleteProfile();
                        let tmplang = localStorage.getItem('language');
                        localStorage.clear();
                        localStorage.setItem('language', tmplang);

                        window.location.reload();
                    } catch (error) {
                        if (error && error.message)
                            displayErrorMessage(error.message);
                        console.error('Error deleting profile:', error);
                    }
                }
            });
        }

        await fetchAndDisplayFriends();
        //await showAchievements();

    } catch (error) {
        console.error('Error fetching and displaying profile:', error);
        if (error && error.message)
            displayErrorMessage(error.message);
        //window.location.href = "/#logout";
    }
}
