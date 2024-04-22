
function chatSelect() {
const userInfo = { nickname: 'User123' };
    const channelsInfo = ['General', 'Random', 'Tech']; 

    const nicknameInput = document.getElementById('nickname');
    if (userInfo.nickname) {
      nicknameInput.value = userInfo.nickname;
    }

    const channelList = document.getElementById('channelList');
    channelsInfo.forEach(channel => {
      const li = document.createElement('li');
      li.textContent = channel;
      channelList.appendChild(li);
    });

    function setNickname() {
      const nickname = document.getElementById('nickname').value;

      redirectToChatPage();
    }

    function createChannel() {
      const channelName = document.getElementById('channelName').value;
      const channelPassword = document.getElementById('channelPassword').value;
     
      redirectToChatPage();
    }

    function redirectToChatPage() {
      window.location.href = '/#chat';
    }
}