function populateChannelDropdown(channels) {
  const dropdown = document.getElementById('channelDropdown');
  if (dropdown) {
    dropdown.innerHTML = '';

    channels.forEach(channel => {
      const option = document.createElement('option');
      option.value = channel;
      option.textContent = channel;
      dropdown.appendChild(option);
    });

    // const createOption = document.createElement('option');
    // createOption.value = 'new';
    // createOption.textContent = 'Create New Channel';
   // dropdown.appendChild(createOption);
    //dropdown.value = 'new';
  }
}

function toggleCreateChannelForm() {
  const dropdown = document.getElementById('channelDropdown');
  const createChannelForm = document.getElementById('createChannelForm');
  const joinChatButton = document.getElementById('joinChatButton');
  const selectedOption = dropdown.value;

  if (selectedOption === 'new') {
    createChannelForm.style.display = 'block';
    joinChatButton.style.display = 'none';
  } else {
    createChannelForm.style.display = 'none';
    joinChatButton.style.display = 'block';
  }
}

async function createNewChannel() {
  const newChannelName = document.getElementById('newChannelName').value;
  const newChannelPassword = document.getElementById('newChannelPassword').value;
  const joinChatButton = document.getElementById('joinChatButton');

  try {
    console.log('Creating new channel:', newChannelName, newChannelPassword);
    chatChannel = newChannelName;
    window.location.href = '/#chatselect';
  } catch (error) {
    console.error('Error creating channel:', error);
    // Handle error
  }
}

async function setNickname() {
  nicknameElement = document.getElementById('nickname');
  if (nicknameElement) {
  const nickname = nicknameElement.value.trim();
  try {
      const jwtToken = localStorage.getItem('jwtToken');
      const formData = new FormData();

      if (!nickname) {
          throw new Error('Nickname cannot be empty.');
      }

      const maxNicknameLength = 50;
      if (nickname.length > maxNicknameLength) {
          throw new Error(`Nickname exceeds the maximum allowed length of ${maxNicknameLength} characters.`);
      }

      const nicknameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!nicknameRegex.test(nickname)) {
          throw new Error('Invalid nickname format. Only alphanumeric characters, underscore, and hyphen are allowed.');
      }

      formData.append('nickname', nickname);
      nicknameElement.textContent = nickname;
      localStorage.setItem('userNickname', nickname);

      const response = await fetch(`/api/manage-profile/`, {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${jwtToken}`,
              'X-CSRFToken': await getCSRFCookie() 
          },
          body: formData
      });

      if (!response.ok) {
          throw new Error('Failed to update nickname.');
        document.getElementById('statusNickname').value = 'Failed';
        document.getElementById('statusNickname').style.color = 'red';  
      
      }

      return await response.json();
      
      document.getElementById('statusNickname').value = 'Success';
      document.getElementById('statusNickname').style.color = 'green';  
      
  } catch (error) {
      console.error('Error updating profile:', error);
      document.getElementById('statusNickname').value = 'Failed';
      document.getElementById('statusNickname').style.color = 'red';  
      
      throw error; 
  }
}
}


function joinChat() {
  const selectedChannel = document.getElementById('channelDropdown').value;
  console.log('Joining chat in channel:', selectedChannel);
  chatChannel = selectedChannel;
  window.location.href = '/#chatselect';
}

function chatSelect() {
  const userInfo = { nickname: localStorage.getItem('userNickname') || 'random'+Math.floor(Math.random()*1000) };
  const channelsInfo = ['#General'];
  const dropdown = document.getElementById('channelDropdown');
  const createChannelForm = document.getElementById('createChannelForm');
  const joinChatButton = document.getElementById('joinChatButton');

  const nicknameInput = document.getElementById('nickname');
  const updateNicknameButton = document.getElementById('updateNicknameButton');
  if (userInfo.nickname && nicknameInput) {
    nicknameInput.value = userInfo.nickname;
    
  }

  if (dropdown) {
    populateChannelDropdown(channelsInfo);
    dropdown.selectedIndex = 0; 
    toggleCreateChannelForm();  
    dropdown.addEventListener('change', toggleCreateChannelForm);
  }
}

function toggleUpdateNicknameButton() {
  const nicknameInput = document.getElementById('nickname');
  const updateNicknameButton = document.getElementById('updateNicknameButton');
  if (nicknameInput.value !== '') {
    updateNicknameButton.style.display = 'block';
  } else {
    updateNicknameButton.style.display = 'none';
  }
}


window.onload = function() {
  chatSelect();
};
