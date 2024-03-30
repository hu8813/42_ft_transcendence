function fetchAndDisplayProfile() {
  // Display the user data stored in localStorage
  document.querySelector('.profile-pic').src = localStorage.getItem("userImage") || 'path/to/your/placeholder-image.jpg'; // Replace 'path/to/your/placeholder-image.jpg' with your placeholder image path
  document.getElementById('nicknameadr').textContent = localStorage.getItem("userNickname") || 'Not available';
  document.getElementById('nicknameadr2').textContent = localStorage.getItem("userNickname") || 'Not available';
  document.getElementById('emailadr').textContent = localStorage.getItem("userEmail") || 'Not available';
  document.getElementById('scoreadr').textContent = localStorage.getItem("userScore") || 'Not available';

  document.getElementById('changeNick').addEventListener('click', function() {
      const newNickname = prompt("Enter new nickname"); // Prompt the user for a new nickname
      if (newNickname !== null && newNickname.trim() !== "") {
          localStorage.setItem("userNickname", newNickname); // Store the new nickname in localStorage
          document.getElementById('nicknameadr').textContent = newNickname; // Update the displayed nickname
          document.getElementById('nicknameadr2').textContent = newNickname; // Update the displayed nickname
      }
  });

  document.getElementById('deleteProfile').addEventListener('click', function() {
      const confirmDelete = confirm("Are you sure you want to delete your profile?"); // Ask for confirmation before deleting the profile
      if (confirmDelete) {
          localStorage.clear();
          window.location.reload(); // Refresh the page or redirect to a confirmation message
      }
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
