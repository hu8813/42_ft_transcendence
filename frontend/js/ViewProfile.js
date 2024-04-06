async function fetchAndDisplayViewProfile(username) {
    try {
      const response = await fetch(`${getBackendURL()}/api/profiles/${username}`);
      if (!response.ok) {
        throw new Error('Profile not found');
      }
      const profileData = await response.json();
  
      // Display profile data
      document.querySelector('.profile-pic').src = profileData.image || '../src/emptyavatar.jpeg';
      document.getElementById('nicknameadr').textContent = profileData.nickname || 'Not available';
      document.getElementById('nicknameadr2').textContent = profileData.nickname || 'Not available';
      document.getElementById('emailadr').textContent = profileData.email || 'Not available';
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
  