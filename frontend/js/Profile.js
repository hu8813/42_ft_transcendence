async function fetchAndDisplayProfile() {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const response = await fetch(`${getBackendURL()}/manage-profile/`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        if (response.ok) {
            const profileData = await response.json();
            const user = profileData.user || {};
            const imageLink = (user.image_link && user.image_link.length >= 4) ? user.image_link : '../src/emptyavatar.jpeg';
            const nickname = user.nickname || 'Not available';
            const email = user.email || 'Not available';

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
                    await updateProfileWithPhoto(formData);
                } catch (error) {
                    console.error('Error updating profile photo:', error);
                }
            });

            document.getElementById('changeNick').addEventListener('click', async function () {
                const newNickname = prompt("Enter new nickname");
                if (newNickname !== null && newNickname.trim() !== "") {
                    try {
                        const updatedProfile = await updateProfile({ nickname: newNickname });
                        document.getElementById('nicknameadr').textContent = newNickname;
                    } catch (error) {
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
                        console.error('Error deleting profile:', error);
                    }
                }
            });
        } else {
            throw new Error('Profile not found');
        }
    } catch (error) {
        console.error('Error fetching and displaying profile:', error);
        //window.location.href = "/#logout";
    }
}

async function updateProfileWithPhoto(formData) {
    const jwtToken = localStorage.getItem('jwtToken');
    
    const response = await fetch(`${getBackendURL()}/manage-profile/`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
        },
        body: formData
    });
    if (!response.ok) {
        throw new Error('Failed to update profile photo');
    }
}

async function updateProfile(data) {
    const jwtToken = localStorage.getItem('jwtToken');
    
    // Validate nickname
    const nicknameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!nicknameRegex.test(data.nickname)) {
        throw new Error('Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.');
    }
    document.getElementById('nicknameadr').textContent = data.nickname;

    // Validate image file extension
    const imageFile = document.getElementById('uploadPhoto').files[0];
    if (imageFile) {
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const extension = imageFile.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            throw new Error('Invalid image file format. Only JPG, JPEG, PNG, or GIF are allowed.');
        }
    }
    
    const response = await fetch(`${getBackendURL()}/manage-profile/`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        throw new Error('Failed to update profile');
    }
    return await response.json();
}

async function deleteProfile() {
    const jwtToken = localStorage.getItem('jwtToken');
    const response = await fetch(`${getBackendURL()}/manage-profile/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${jwtToken}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to delete profile');
    }
}