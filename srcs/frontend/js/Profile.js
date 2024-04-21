function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
        errorMessageElement.style.color = 'red';
        errorMessageElement.style.fontSize = '0.6em';
    }
}
function isLocalDeployment() {
    return window.location.href.includes("pong42");
}


async function uploadImage(imageFile) {
    try {
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

async function fetchAndDisplayProfile() {
    const errorMessageElement = document.getElementById('errorMessage');
    csrfToken = await getCSRFCookie();
    async function fetchAndDisplayAchievements() {
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const response = await fetch('/api/user-achievements', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });
            if (response.ok) {
                const achievementsData = await response.json();
            
                const gamesPlayed = achievementsData.games_played || 0;
                const gamesWon = achievementsData.games_won || 0;
                const winningRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(2) : 0;
            
                const totalPlayedElement = document.getElementById('total-played');
                if (totalPlayedElement) {
                    totalPlayedElement.textContent = `Total Games Played: ${gamesPlayed}`;
                }
            
                const winningRateElement = document.getElementById('winning-rate');
                if (winningRateElement) {
                    winningRateElement.textContent = `Winning Rate: ${winningRate}%`;
                }
            
                const totalWonElement = document.getElementById('total-won');
                if (totalWonElement) {
                    totalWonElement.textContent = `Total Wins: ${gamesWon}`;
                }
            
                const totalLostElement = document.getElementById('total-lost');
                if (totalLostElement) {
                    totalLostElement.textContent = `Total Losses: ${achievementsData.games_lost || 0}`;
                }
            } 
            else {
                const achievementsNotFound = await response.json();
                if (achievementsNotFound.error) {
                    if (document.getElementById('total-played'))
                        document.getElementById('total-played').textContent = 'Total Games Played: 0';
                    if (document.getElementById('total-won'))
                        document.getElementById('total-won').textContent = 'Total Wins: 0';
                    if (document.getElementById('total-lost'))
                        document.getElementById('total-lost').textContent = 'Total Losses: 0';
                   } else {
                    throw new Error('Failed to fetch achievements');
                }
            }
        } catch (error) {
            console.error('Error fetching and displaying achievements:', error);
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
                        const friendLink = document.createElement('a');
                        friendLink.href = `/#viewprofile?u=${friend.username}`;
                        friendLink.textContent = friend.username; 
                        friendLink.classList.add('bn');
                        friendElement.appendChild(friendLink);
                        
                        const profileImage = document.createElement('img');
                        profileImage.src = friend.image_link ? friend.image_link : './src/emptyavatar.jpeg'; 
                        profileImage.alt = `${friend.username}'s profile image`;
                        profileImage.width = 50;  
                        profileImage.height = 50;  
                        profileImage.style.marginRight = '10px';  
                        profileImage.classList.add('profile-image');
                        friendElement.appendChild(profileImage);
                        
                        friendListElement.appendChild(friendElement);
                    });
                    
                }
            } else {
                throw new Error('Failed to fetch friends');
            }
        } catch (error) {
            console.error('Error fetching and displaying friends:', error);
            displayErrorMessage('Failed to fetch friends');
        }
    }
    
    fetchAndDisplayFriends();
    fetchAndDisplayAchievements();
    async function updateProfile(data) {
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const formData = new FormData();
    
            if (data.nickname) {
                const maxNicknameLength = 50; 
                if (data.nickname.length > maxNicknameLength) {
                    throw new Error(`Nickname exceeds the maximum allowed length of ${maxNicknameLength} characters.`);
                }
            
                const nicknameRegex = /^[a-zA-Z0-9_-]+$/;
                if (!nicknameRegex.test(data.nickname)) {
                    throw new Error('Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.');
                }
            
                formData.append('nickname', data.nickname);
                document.getElementById('nicknameadr').textContent = data.nickname;
                localStorage.setItem('userNickname', data.nickname);
            }
    
            if (data.image) {
                const imageFile = data.image;
                const imageLink = await uploadImage(imageFile);
                formData.append('image_link', imageLink);
                document.querySelector('.profile-pic').src = imageLink; 
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
                throw new Error('Failed to update profile');
            }
    
            const responseData = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw new Error('Failed to update profile');
        }
    }


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
            const profileData = await response.json();
            const user = profileData.user_info || {};
            const imageLink = (user.image_link && user.image_link.length >= 4) ? user.image_link : '../src/emptyavatar.jpeg';
            const nickname = user.userNickname || user.userLogin || 'Not available';
            const email = user.email || 'Not available';
            const score = user.score || 0;
            const csrfTokenNew = user.csrfToken || csrfToken;
            if (csrfTokenNew)
                setCSRFCookie(csrfTokenNew);
            
            const profilePicElement = document.querySelector('.profile-pic');
            if (profilePicElement) {
                profilePicElement.src = imageLink;
            }

            const nicknameElement = document.getElementById('nicknameadr');
            if (nicknameElement) {
                nicknameElement.textContent = nickname;
            }

            const emailElement = document.getElementById('emailadr');
            if (emailElement) {
                emailElement.textContent = email;
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
    
                } catch (error) {
                    if (error.message)
                        displayErrorMessage(error.message);
                    console.error('Error updating profile photo:', error);
                }
                
            });
            }
            
            if (document.getElementById('changeNick')) {
            document.getElementById('changeNick').addEventListener('click', async function () {
                const newNickname = prompt("Enter new nickname");
                if (newNickname !== null && newNickname.trim() !== "") {
                    try {
                        await updateProfile({ nickname: newNickname });
                    } catch (error) {
                        if (error.message)
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
                        if (error.message)
                            displayErrorMessage(error.message);
                        console.error('Error deleting profile:', error);
                    }
                }
            });}
        } else {
            displayErrorMessage('Profile not found');
            throw new Error('Profile not found');
        }
    
    } catch (error) {
        console.error('Error fetching and displaying profile:', error);
        if (error.message)
            displayErrorMessage(error.message);
        //window.location.href = "/#logout";
    }
}

async function deleteProfile() {
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
}
