function fetchAndDisplayProfile() {

  document.querySelector('.profile-pic').src = localStorage.getItem("userImage") || './static/src/emptyavatar.jpeg'; 
  document.getElementById('nicknameadr').textContent = localStorage.getItem("userNickname") || 'Not available';
  document.getElementById('nicknameadr2').textContent = localStorage.getItem("userNickname") || 'Not available';
  document.getElementById('emailadr').textContent = localStorage.getItem("userEmail") || 'Not available';
  document.getElementById('scoreadr').textContent = localStorage.getItem("userScore") || 'Not available';

  document.getElementById('changeNick').addEventListener('click', function() {
      const newNickname = prompt("Enter new nickname"); 
      if (newNickname !== null && newNickname.trim() !== "") {
          localStorage.setItem("userNickname", newNickname); 
          document.getElementById('nicknameadr').textContent = newNickname; 
          document.getElementById('nicknameadr2').textContent = newNickname; 
      }
  });

  document.getElementById('deleteProfile').addEventListener('click', function() {
      const confirmDelete = confirm("Are you sure you want to delete your profile?"); 
      if (confirmDelete) {
          localStorage.clear();
          window.location.reload(); 
      }
  });

  document.getElementById('changePhoto').addEventListener('click', function() {
      document.getElementById('uploadPhoto').click(); 
  });
}

function uploadPhoto(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          localStorage.setItem("userImage", e.target.result); 
          document.querySelector('.profile-pic').src = e.target.result; 
      };
      reader.readAsDataURL(file);
  }
}
