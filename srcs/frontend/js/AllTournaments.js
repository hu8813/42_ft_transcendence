function allTournaments() {
const apiUrl = '/api/get_tournament_data';
const itemsPerPage = 10; // Adjust as needed

let currentPage = 1;
let totalTournaments = 0;

async function fetchTournaments(page) {
    try {
        const jwtToken = localStorage.getItem('jwtToken');
        const csrfToken = await getCSRFCookie();

        const response = await fetch(`${apiUrl}?page=${page}&items=${itemsPerPage}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': csrfToken
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Failed to fetch tournaments');
        }
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return null;
    }
}

async function displayTournaments(page) {
    const tournamentList = document.getElementById('tournament-list');
    if (tournamentList) {
        tournamentList.innerHTML = '';

    const data = await fetchTournaments(page);
    if (data) {
        totalTournaments = data.total;
        const tournaments = data.tournaments;

        tournaments.forEach(tournament => {
            const listItem = document.createElement('li');
            listItem.textContent = tournament.name;
            listItem.addEventListener('click', () => {
                showTournamentDetails(tournament);
            });
            tournamentList.appendChild(listItem);
        });

        renderPaginationControls();
    }
}
}

function renderPaginationControls() {
    const totalPages = Math.ceil(totalTournaments / itemsPerPage);

    const paginationContainer = document.getElementById('pagination-container');
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

async function showTournamentDetails(tournament) {
    // Display tournament details on the page
    const tournamentDetailsContainer = document.getElementById('tournament-details');
    tournamentDetailsContainer.innerHTML = '';

    const tournamentName = document.createElement('h2');
    tournamentName.textContent = tournament.name;
    tournamentDetailsContainer.appendChild(tournamentName);

    const savedDate = document.createElement('p');
    savedDate.textContent = `Saved Date: ${tournament.saved_date}`;
    tournamentDetailsContainer.appendChild(savedDate);

    const winner = document.createElement('p');
    winner.textContent = `Winner: ${tournament.winner}`;
    tournamentDetailsContainer.appendChild(winner);

    const matches = document.createElement('ul');
    tournament.matches.forEach(match => {
        const matchItem = document.createElement('li');
        matchItem.textContent = match;
        matches.appendChild(matchItem);
    });
    tournamentDetailsContainer.appendChild(matches);
}

// Initial display
displayTournaments(currentPage);
   
}