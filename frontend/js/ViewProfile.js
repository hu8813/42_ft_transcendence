async function fetchAndDisplayViewProfile(username) {
    console.log(username);
    try {
      const response = await fetch(`${getBackendURL()}/api/profiles/?username=${username}`);
      if (!response.ok) {
          throw new Error('Profile not found');
      }
      console.log('Response:', response);
        const profileData = await response.json();
        console.log('Profile data:', profileData);

      // Display profile data
      document.querySelector('.profile-pic').src = profileData.image_link || '../src/emptyavatar.jpeg';
      document.getElementById('nicknameadr').textContent = profileData.nickname || 'Not available';
      document.getElementById('nicknameadr2').textContent = profileData.login || 'Not available';
      document.getElementById('scoreadr').textContent = profileData.score || 'Not available';

      
  } catch (error) {
      console.error('Error fetching and displaying profile:', error);
      // Handle error, e.g., display error message
  }
}
