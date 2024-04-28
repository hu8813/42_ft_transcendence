function allTournaments() {
    const itemsPerPage = 10; // Adjust as needed
    let currentPage = 1;
    let totalTournaments = 0;

    async function fetchTournaments(page) {
        try {
            const jwtToken = localStorage.getItem('jwtToken');
            const csrfToken = await getCSRFCookie();

            const response = await fetch(`/api/get_tournament_data?page=${page}&items=${itemsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'X-CSRFToken': csrfToken
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data; // Extract tournamentData from the JSON response
            } else {
                throw new Error('Failed to fetch tournaments');
            }
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            return null;
        }
    }

    async function displayTournaments(page) {
        const leaderboardBody = document.getElementById('leaderboard-body');
        if (leaderboardBody) {
            leaderboardBody.innerHTML = '';
    
            const data = await fetchTournaments(page);
            if (data) {
                totalTournaments = data.total; // Use the length of tournamentData array
                const tournaments = data.tournamentData;
    
                if (totalTournaments === 0) {
                    // Show "No data available" message
                    const noDataRow = document.createElement('tr');
                    const noDataCell = document.createElement('td');
                    noDataCell.colSpan = 4;
                    noDataCell.textContent = 'No data available';
                    noDataRow.appendChild(noDataCell);
                    leaderboardBody.appendChild(noDataRow);
                } else {
                    // Render the list of tournaments
                    tournaments.forEach((tournament, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${tournament.saved_date}</td>
                            <td>${tournament.name}</td>
                            <td>${tournament.winner}</td>
                        `;
                        leaderboardBody.appendChild(row);
    
                        // Attach event listener to the row
                        row.addEventListener('click', () => {
                            showTournamentDetails(tournament);
                        });
                    });
    
                    renderPaginationControls();
                }
            }
        }
    }
    
    function renderPaginationControls() {
        const totalPages = Math.ceil(totalTournaments / itemsPerPage);

        const paginationContainer = document.getElementById('pagination-container2');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                displayTournaments(currentPage);
            });
            paginationContainer.appendChild(pageButton);
        }
    }

    let detailsContainerOpen = false;

    async function showTournamentDetails(tournament) {
        // Display tournament details on the page
        const tournamentDetailsContainer = document.getElementById('tournament-details');
        tournamentDetailsContainer.innerHTML = '';
    
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.addEventListener('click', () => {
            tournamentDetailsContainer.style.display = 'none';
        });
        tournamentDetailsContainer.appendChild(closeBtn);
    
        const tournamentName = document.createElement('h2');
        tournamentName.textContent = tournament.name;
        tournamentDetailsContainer.appendChild(tournamentName);
    
        const savedDate = document.createElement('p');
        savedDate.textContent = `Date: ${tournament.saved_date}`;
        tournamentDetailsContainer.appendChild(savedDate);
    
        const winner = document.createElement('p');
        winner.textContent = `Winner: ${tournament.winner}`;
        tournamentDetailsContainer.appendChild(winner);
    
        // Display the matches if available
        if (tournament.matches && tournament.matches.length > 0) {
            const matchesTitle = document.createElement('h3');
            matchesTitle.textContent = 'Matches';
            tournamentDetailsContainer.appendChild(matchesTitle);
    
            const matchesList = document.createElement('ul');
            tournament.matches.forEach(match => {
                const matchItem = document.createElement('li');
                matchItem.textContent = match;
                matchesList.appendChild(matchItem);
            });
            tournamentDetailsContainer.appendChild(matchesList);
        }
    
        // Show the details container
        tournamentDetailsContainer.style.display = 'block';
    }
    
function closeDetailsContainerOutside(event) {
    const tournamentDetailsContainer = document.getElementById('tournament-details');
    if (!tournamentDetailsContainer.contains(event.target)) {
        tournamentDetailsContainer.style.display = 'none';
        detailsContainerOpen = false;
        document.removeEventListener('click', closeDetailsContainerOutside);
    }
}

    
    // Initial display
    displayTournaments(currentPage);
}
