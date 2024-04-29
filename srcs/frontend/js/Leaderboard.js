let leaderboardData = null; 
let currentPage = 1;
const entriesPerPage = 5;

async function fetchLeaderboardData() {
  try {
      const jwtToken = localStorage.getItem('jwtToken');
      let csrfToken = await getCSRFCookie();

      const response = await fetch(`/api/leaderboard/`, {
          headers: {
              'Authorization': `Bearer ${jwtToken}`,
              'X-CSRFToken': csrfToken
          }
      });

      if (response.ok) {
          const data = await response.json();
          if ('error' in data) {
              leaderboardData = null;
              window.location.href = "/#logout";
          } else {
              leaderboardData = data;
          }
      } else {
          throw new Error('Failed to fetch data');
      }
  } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      leaderboardData = null;
      window.location.href = "/#logout";
  }
}

async function displayLeaderboard() {
  function renderPaginationControls() {
    const totalPages = Math.ceil(leaderboardData.length / entriesPerPage);

    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
        paginationContainer.innerHTML = '';


        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                displayLeaderboard();
            });
            paginationContainer.appendChild(pageButton);
        }
    } else {
    }
}

translate(currentLanguage);
function openProfile(username) {
    window.location.href = `#viewprofile?u=${username}`;
}
  const leaderboardBody = document.getElementById('leaderboard-body');

  if (!leaderboardData || leaderboardData.length === 0) {
      await fetchLeaderboardData();
  }

  if (leaderboardBody && leaderboardData && leaderboardData.length > 0) {
      leaderboardBody.innerHTML = '';
      const startIndex = (currentPage - 1) * entriesPerPage;
      const endIndex = Math.min(startIndex + entriesPerPage, leaderboardData.length);
      for (let index = startIndex; index < endIndex; index++) {
        const member = leaderboardData[index];
        const row = document.createElement('tr');
        let winRate = member.winning_rate * 2;
        row.innerHTML = `
            <td>${index + 1}  &nbsp; ${index < 3 ? `<i class="bi bi-trophy-fill" style="color: ${index === 0 ? 'gold' : (index === 1 ? '#A7A7AD ' : '#A77044')}"></i>` : ''}</td>
            <td>
                <div class="c-media">
                    <div class="c-avatar c-media__img" style="background-color: ${getRandomColor()}">
                        ${member.image_link ? `<img style="width: 55px; height: 55px; max-width: 55px; max-height: 55px;" src="${member.image_link}" alt="${member.username}" data-username="${member.username}" />` : `<img style="width: 55px; height: 55px; max-width: 55px; max-height: 55px;" src="../src/emptyavatar.jpeg" alt="${member.username}" data-username="${member.username}" />`}
                    </div>
                    <div class="c-media__content">
                        <div class="c-media__title">
                            <button class="button bn view-profile-btn" data-username="${member.username}" style="background-color:#333333;" title="View Profile"><span class="bi bi-person"></span></button> ${member.nickname}
                        </div>
                    </div>
                </div>
            </td>
            <td>${await calculatePointsProgressBar(member.score)}</td> 
            <td>${await calculateWinningRateProgressBar(winRate)}</td>
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
        }

        renderPaginationControls();
    } else {
        if (leaderboardBody)
            leaderboardBody.innerHTML = '<tr><td colspan="7"><span id="">No data available</span></td></tr>';
    }
}

async function calculateWinningRateProgressBar(winningRate) {
    const percentage = winningRate  * 50; // Assuming winning rate is in decimal form (0.0 to 1.0)
    const progressBar = `
        <div class="progress" style="height: 20px;width: 50%">
            <div class="progress-bar" role="progressbar" style="width: ${percentage}%; background-color: #28a745;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" title="Winning Rate: ${percentage.toFixed(2)}%">
                &nbsp;
            </div>
        </div>
    `;
    return progressBar;
}




function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

async function calculatePointsProgressBar(points) {
    // Assuming maximum points is 100
    const percentage = (points / 100) * 100;
    const progressBar = `
        <div class="progress" style="height: 20px;width: 100%">
            <div class="progress-bar" role="progressbar" style="width: ${percentage}%; background-color: #ffc107;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" title="Points: ${points}">
                &nbsp;
            </div>
        </div>
    `;
    return progressBar;
}


async function calculateDaysSinceJoining(dateString) {
  const dateJoined = new Date(dateString);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - dateJoined.getTime();
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

  
  const percentage = ((daysDifference + 1) / 25) * 50; 

  
  const days_since = await translateKey('days');

  
  const progressBar = `
    <div class="progress" style="height: 20px;width: 50%">
      <div class="progress-bar" role="progressbar" style="width: ${percentage}%; background-color: #007bff;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="50" title="${daysDifference} ${days_since}">
        &nbsp;
      </div>
    </div>
  `;

  return progressBar;
}







