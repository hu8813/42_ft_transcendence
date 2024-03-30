
console.log("leaderboard");
fetch('https://pong42.azurewebsites.net/leaderboard/')
  .then(response => response.json())
  .then(leaderboardData => {
    console.log("data:"+leaderboardData);
    const leaderboardBody = document.getElementById('leaderboard-body');

    if (leaderboardData && leaderboardData.length > 0) {
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
                <div class="c-media__title">${member.username}</div>
              </div>
            </div>
          </td>
          <td>${member.score || 0}</td>
          <td>${calculateDaysSinceJoining(member.date_joined)} days</td>
          <td><button class="button bn"><span class="bi bi-person"></span></button></td>
          <td><button class="button bn"><span class="bi bi-play-fill"></span></button></td>
          <td><button class="button bn"><span class="bi bi-person-plus-fill"></span></button></td>
        `;
        leaderboardBody.appendChild(row);
      });
    } else {
      // Display a message if there is no data
      leaderboardBody.innerHTML = '<tr><td colspan="7">No data available</td></tr>';
    }
  })
  .catch(error => console.error('Error fetching leaderboard data:', error));

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function calculateDaysSinceJoining(dateString) {
  const dateJoined = new Date(dateString);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - dateJoined.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
  return daysDifference;
}
