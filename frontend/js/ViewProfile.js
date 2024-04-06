async function fetchAndDisplayViewProfile(username) {
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

      // Hide or disable edit/delete functionality for view profile

      // Hide or disable edit nickname functionality
      document.getElementById('changeNick').style.display = 'none'; // or set disabled attribute

      // Hide or disable delete profile functionality
      document.getElementById('deleteProfile').style.display = 'none'; // or set disabled attribute

      // Hide or disable change photo functionality
      document.getElementById('changePhoto').style.display = 'none'; // or set disabled attribute
  } catch (error) {
      console.error('Error fetching and displaying profile:', error);
      // Handle error, e.g., display error message
  }
}
