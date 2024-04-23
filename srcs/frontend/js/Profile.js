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

async function updateProfile(data) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const formData = new FormData();
        let res;
        if (data.nickname) {
            const maxNicknameLength = 50;
            if (data.nickname.length > maxNicknameLength) {
                throw new Error(`Nickname exceeds the maximum allowed length of ${maxNicknameLength} characters.`);
            }

            const nicknameRegex = /^[a-zA-Z0-9_-]+$/;
            if (!nicknameRegex.test(data.nickname)) {
                displayErrorMessage('Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.');
                throw new Error('Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.');
            }

            formData.append('nickname', data.nickname);
            
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
            //displayErrorMessage(response.message);
            throw new Error('Failed to update profile');
        }
        res = await response.json();
        return res;
    } catch (error) {
        
        console.error('Error updating profile:', error);
        displayErrorMessage(error);
        throw new Error('Failed to update profile');
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

                    // Create an element to display friend's online status
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
            const achievementsNotFound = await response.json();
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
        if (response && response.message)
        displayErrorMessage(response.message);

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

    try {
        const profileData = await fetchProfileData();
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
                    await fetchLeaderboardData();
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
                        userNickname = newNickname;
                        if (document.getElementById('nicknameadr'))
                            document.getElementById('nicknameadr').textContent = newNickname;
                        localStorage.setItem('userNickname', newNickname);
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
        await fetchAndDisplayAchievements();

    } catch (error) {
        console.error('Error fetching and displaying profile:', error);
        if (error && error.message)
            displayErrorMessage(error.message);
        //window.location.href = "/#logout";
    }
}
