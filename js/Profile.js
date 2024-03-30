function fetchAndDisplayProfile() {
    // Display the user data stored in localStorage
    document.querySelector('.profile-pic').src = localStorage.getItem("userImage") || 'path/to/your/placeholder-image.jpg'; // Replace 'path/to/your/placeholder-image.jpg' with your placeholder image path
    document.getElementById('nicknameadr').textContent = localStorage.getItem("userNickname") || 'Not available';
    document.getElementById('nicknameadr2').textContent = localStorage.getItem("userNickname") || 'Not available';
    
    //document.getElementById('login').textContent = localStorage.getItem("userLogin") || 'Not available';
    document.getElementById('emailadr').textContent = localStorage.getItem("userEmail") || 'Not available';
    document.getElementById('scoreadr').textContent = localStorage.getItem("userScore") || 'Not available';
  
  
  document.getElementById('deleteProfile').addEventListener('click', function() {
    localStorage.clear();
    window.location.reload(); // Refresh the page or redirect to a confirmation message
  });
  
  document.getElementById('changePhoto').addEventListener('click', function() {
    document.getElementById('uploadPhoto').click(); // Open the file selection dialog
  });
}

  function uploadPhoto(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        localStorage.setItem("userImage", e.target.result); // Store the image data URL in localStorage
        document.querySelector('.profile-pic').src = e.target.result; // Immediately update the profile picture
      };
      reader.readAsDataURL(file);
    }
  }

