function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
        errorMessageElement.style.color = 'red';
        errorMessageElement.style.fontSize = '0.6em';
    }
}

async function fetchAndDisplayProfile() {
    const errorMessageElement = document.getElementById('errorMessage');

    async function updateProfile(data) {
        const jwtToken = localStorage.getItem('jwtToken');
        if (!csrfToken)
            csrfToken = await getCSRFCookie();

        const formData = new FormData();

        // Validate and append nickname if provided
        if (data.nickname) {
            const nicknameRegex = /^[a-zA-Z0-9_-]+$/;
            if (!nicknameRegex.test(data.nickname)) {
                displayErrorMessage('Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.');
                throw new Error('Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.');
            }
            formData.append('nickname', data.nickname);
            document.getElementById('nicknameadr').textContent = data.nickname;
        }

        // Append image if provided
        if (data.image) {
            const imageFile = data.image;
            formData.append('image', imageFile);
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
            displayErrorMessage('Failed to update profile');
            throw new Error('Failed to update profile');
        }
        const responseData = await response.json();
        return responseData; 
    }

    if (!csrfToken)
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
                localStorage.setItem('csrfToken', csrfTokenNew);
            document.querySelector('.profile-pic').src = imageLink;
            document.getElementById('nicknameadr').textContent = nickname;
            document.getElementById('emailadr').textContent = email;

            document.getElementById('changePhoto').addEventListener('click', function () {
                document.getElementById('uploadPhoto').click();
            });

            document.getElementById('uploadPhoto').addEventListener('change', async function () {
                // Handle file upload here
                const imageFile = this.files[0];
                const formData = new FormData();
                formData.append('image', imageFile);
                try {
                    const responseData = await updateProfile({ image: imageFile });
                    const imageLink = responseData.image_link || '../src/emptyavatar.jpeg'; // Use default if image_link is not provided
                    document.querySelector('.profile-pic').src = imageLink; // Update image source
                } catch (error) {
                    if (error.message)
                        displayErrorMessage(error.message);
                    console.error('Error updating profile photo:', error);
                }
            });

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
            });
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
