function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
        errorMessageElement.style.color = 'red';
        errorMessageElement.style.fontSize = '0.6em';
    }
}

async function uploadImage(imageFile) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await fetch(`${getBackendURL()}/upload-avatar/`, {
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
                document.querySelector('.profile-pic').src = imageLink; // Update image source
            }
    
            const response = await fetch(`${getBackendURL()}/manage-profile/`, {
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

    csrfToken = await getCSRFCookie();

    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`${getBackendURL()}/manage-profile/`, {
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
                const imageFile = this.files[0];
                try {
                    const imageLink = await uploadImage(imageFile);
                    const timestamp = new Date().getTime(); // Generate a timestamp
                    const updatedImageLink = `${imageLink}?t=${timestamp}`; // Append timestamp as a query parameter
                    document.querySelector('.profile-pic').src = updatedImageLink; // Update image source
    
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
    const response = await fetch(`${getBackendURL()}/manage-profile/`, {
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
