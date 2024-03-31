let leaderboardData = null; // Variable to store leaderboard data

function fetchLeaderboardData() {
  return fetch('https://pong42.azurewebsites.net/leaderboard/')
    .then(response => response.json())
    .then(data => {
      leaderboardData = data; // Save the fetched data in the variable
    })
    .catch(error => {
      console.error('Error fetching leaderboard data:', error);
      leaderboardData = null; // Set leaderboardData to null in case of error
    });
}

async function displayLeaderboard() {
  const leaderboardBody = document.getElementById('leaderboard-body');

  // Check if leaderboardData is empty or undefined
  if (!leaderboardData || leaderboardData.length === 0) {
    // If empty or undefined, fetch the data again
    await fetchLeaderboardData();
  }

  if (leaderboardData && leaderboardData.length > 0) {
    leaderboardBody.innerHTML = ''; // Clear existing content
    leaderboardData.forEach((member, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
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
        <td>${calculateDaysSinceJoining(member.date_joined)} </td>
        
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

function calculateDaysSinceJoining(dateString) {
  const dateJoined = new Date(dateString);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - dateJoined.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

  // Calculate the percentage of days passed since joining
  const percentage = (daysDifference / 50) * 100; // Assuming 365 days in a year

  // Generate Bootstrap progress bar with tooltip
  const progressBar = `
    <div class="progress" style="height: 20px;">
      <div class="progress-bar" role="progressbar" style="width: ${percentage}%; background-color: #007bff;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" title="${daysDifference} days since joining">
        &nbsp;
      </div>
    </div>
  `;

  return progressBar;
}



function generateProgressBar(days) {
  const maxLength = 14; // Maximum length of the progress bar
  const filledLength = Math.min(Math.round(days / 1), maxLength); // Assuming 1 character per 30 days

  // Create the progress bar string
  let progressBar = '';
  for (let i = 0; i < filledLength; i++) {
    progressBar += '=';
  }

  // Pad the progress bar string to the maximum length
  progressBar = progressBar.padEnd(maxLength, '.');

  return progressBar;
}

