let leaderboardData = null; 
let fetchInProgress = false;

async function fetchLeaderboardData() {
  if (fetchInProgress) {
      console.log('Fetch request already in progress. Ignoring...');
      return;
  }

  try {
      fetchInProgress = true;

      const response = await fetch(`${getBackendURL()}/leaderboard/`);
      const data = await response.json();
      leaderboardData = data;

      if (leaderboardData !== null) {
          setTimeout(() => {
              fetchInProgress = false;
          }, 5000);
      }
  } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      leaderboardData = null;
      fetchInProgress = false; 
  }
}

async function displayLeaderboard() {

  function openProfile(username) {
    window.location.href = `#viewprofile?u=${username}`;
  }

  const leaderboardBody = document.getElementById('leaderboard-body');

  if (!leaderboardData || leaderboardData.length === 0) {
    await fetchLeaderboardData();
  }

  if (leaderboardBody && leaderboardData && leaderboardData.length > 0) {
    leaderboardBody.innerHTML = '';
    leaderboardData.forEach(async (member, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}  &nbsp; ${index < 3 ? `<i class="bi bi-trophy-fill" style="color: ${index === 0 ? 'gold' : (index === 1 ? '#A7A7AD ' : '#A77044')}"></i>` : ''}</td>
        <td>
          <div class="c-media">
            <div class="c-avatar c-media__img" style="background-color: ${getRandomColor()}">
              ${member.image_link ? `<img style="width: 55px; height: 55px; max-width: 55px; max-height: 55px;" src="${member.image_link}" alt="${member.username}" data-username="${member.username}" />` : `<div class="default-profile-pic" data-username="${member.username}"></div>`}
            </div>
            <div class="c-media__content">
              <div class="c-media__title">
                <button class="button bn view-profile-btn" data-username="${member.username}" title="View Profile"><span class="bi bi-person"></span></button> ${member.username}
              </div>
            </div>
          </div>
        </td>
        <td>${member.score || 0}</td>
        <td>${await calculateDaysSinceJoining(member.date_joined)}</td>
      `;
      leaderboardBody.appendChild(row);
      
      
      const viewProfileButton = row.querySelector('.view-profile-btn');
      viewProfileButton.addEventListener('click', (event) => {
        event.preventDefault(); 
        const username = event.currentTarget.getAttribute('data-username');
        openProfile(username);
      });

      
      const profileImage = row.querySelector('.c-avatar img');
      if (profileImage) {
        profileImage.addEventListener('click', (event) => {
          const username = event.currentTarget.getAttribute('data-username');
          openProfile(username);
        });
      }

      
      const usernameElement = row.querySelector('.c-media__title');
      if (usernameElement) {
        usernameElement.addEventListener('click', (event) => {
          const username = event.currentTarget.querySelector('.view-profile-btn').getAttribute('data-username');
          openProfile(username);
        });
      }
    });
  } else {
    leaderboardBody.innerHTML = '<tr><td colspan="7">No data available</td></tr>';
  }
}



function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}


async function calculateDaysSinceJoining(dateString) {
  const dateJoined = new Date(dateString);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - dateJoined.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

  
  const percentage = ((daysDifference + 1) / 50) * 100; 

  
  const days_since = await translateKey('leaderboard.days');

  
  const progressBar = `
    <div class="progress" style="height: 20px;">
      <div class="progress-bar" role="progressbar" style="width: ${percentage}%; background-color: #007bff;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" title="${daysDifference} ${days_since}">
        &nbsp;
      </div>
    </div>
  `;

  return progressBar;
}




function generateProgressBar(days) {
  const maxLength = 14; 
  const filledLength = Math.min(Math.round(days / 1), maxLength); 

  
  let progressBar = '';
  for (let i = 0; i < filledLength; i++) {
    progressBar += '=';
  }

  
  progressBar = progressBar.padEnd(maxLength, '.');

  return progressBar;
}

