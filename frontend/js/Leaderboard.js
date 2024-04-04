let leaderboardData = null; 

async function fetchLeaderboardData() {
  try {
    const response = await fetch(`${backendURL}/leaderboard/`);     const data = await response.json();
    leaderboardData = data;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    leaderboardData = null;
  }
}

async function displayLeaderboard() {
  const leaderboardBody = document.getElementById('leaderboard-body');

  
  if (!leaderboardData || leaderboardData.length === 0) {
    
    await fetchLeaderboardData();
  }

  if (leaderboardData && leaderboardData.length > 0) {
    leaderboardBody.innerHTML = ''; 
    leaderboardData.forEach(async (member, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}  &nbsp; ${index < 3 ? `<i class="bi bi-trophy-fill" style="color: ${index === 0 ? 'gold' : (index === 1 ? '#A7A7AD ' : '#A77044')}"></i>` : ''}</td>
        <td>
          <div class="c-media">
            <div class="c-avatar c-media__img" style="background-color: ${getRandomColor()}">
              ${member.image_link ? `<img style="width: 55px; height: 55px; max-width: 55px; max-height: 55px;" src="${member.image_link}" alt="${member.username}" />` : `<div class="default-profile-pic"></div>`}
            </div>
            <div class="c-media__content">
              <div class="c-media__title"><button class="button bn" title="View Profile"><span class="bi bi-person"></span></button> ${member.username}</div>
            </div>
          </div>
        </td>
        <td>${member.score || 0}</td>
        <td>${await calculateDaysSinceJoining(member.date_joined)}</td> <!-- Await the result of calculateDaysSinceJoining -->
      `;
      leaderboardBody.appendChild(row);
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

  
  const percentage = (daysDifference / 50) * 100; 

  
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

