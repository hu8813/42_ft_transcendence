async function fetchAndDisplayViewProfile(username) {
    console.log(username);
    try {
        const response = await fetch(`${getBackendURL()}/api/profiles/?username=${username}`);
        if (!response.ok) {
            throw new Error('Profile not found');
        }

        const profileData = await response.json();

        // Accessing nested data under 'user'
        const user = profileData.user || {}; // Default to an empty object if user data is missing
        const imageLink = user.image_link || '../src/emptyavatar.jpeg';
        const nickname = user.nickname || 'Not available';
        const login = user.login || 'Not available';
        const score = user.score || '0';

        // Display profile data
        document.querySelector('.profile-pic').src = imageLink;
        document.getElementById('nicknameadr').textContent = nickname;
        document.getElementById('nicknameadr2').textContent = login;
        document.getElementById('scoreadr').textContent = score;
        document.getElementById('addFriend').addEventListener('click', function() {
            // Implement the functionality to add the user as a friend
            // For example, you can make an API request to add the user as a friend
            // or perform any other necessary action.
            console.log('Adding as friend...');
        });
        document.getElementById('viewScores').addEventListener('click', function() {
            // Implement the functionality to view recent scores
            // For example, you can display a modal with the user's recent scores
            // or navigate to a separate page showing the scores.
            console.log('Viewing recent scores...');
        });
    } catch (error) {
        console.error('Error fetching and displaying profile:', error);
        // Handle error, e.g., display error message
    }
}
