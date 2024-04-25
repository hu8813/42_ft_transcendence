function playRound(playerSelection, computerSelection) {
    if ((playerSelection === "rock" && computerSelection === "rock")
        || (playerSelection === "paper" && computerSelection === "paper")
        || (playerSelection === "scissors" && computerSelection === "scissors")) {
        return "drew";
    } else if ((playerSelection === "rock" && computerSelection === "scissors")
        || (playerSelection === "paper" && computerSelection === "rock")
        || (playerSelection === "scissors" && computerSelection === "paper")) {
        return "won";
    } else if ((playerSelection === "rock" && computerSelection === "paper")
        || (playerSelection === "paper" && computerSelection === "scissors")
        || (playerSelection === "scissors" && computerSelection === "rock")) {
        return "lost";
    }
}

function getComputerChoice() {
    let num = Math.floor(Math.random() * 3);
    if (num === 0)
        return "rock";
    else if (num === 1)
        return "paper";
    else
        return "scissors";
}

async function playRPS() {
    const container = document.querySelector(".rps-player-block");
    container.querySelectorAll('.select').forEach(button => {
        button.addEventListener('click', async function() {
            document.getElementById('c-rock').style.backgroundColor = "black";
            document.getElementById('c-paper').style.backgroundColor = "black";
            document.getElementById('c-scissors').style.backgroundColor = "black";
            const playerSelection = button.id.split('-')[1];
            const computerSelection = getComputerChoice();
            if (computerSelection == "rock")
                document.getElementById('c-rock').style.backgroundColor = "red";
            else if (computerSelection == "paper")
                document.getElementById('c-paper').style.backgroundColor = "red";
            else
                document.getElementById('c-scissors').style.backgroundColor = "red";
            const result = playRound(playerSelection, computerSelection);
            if (result === 'won') {
                document.getElementById('playerscore').textContent = `${++won}`;
                if (won === 7) {
                    on("You");
                    const jwtToken = localStorage.getItem('jwtToken');
                    const csrfToken = await getCSRFCookie(); 
                    try {
                        const response = await fetch(`/api/update-score?result=win&gametype=rps&oppononent=cpu`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${jwtToken}`,
                                'X-CSRFToken': csrfToken
                            },
                        });
                        if (response.ok) {
                            await fetchLeaderboardData();
                            //console.log('User score updated successfully');
                        } else {
                            console.error('Failed to update user score');
                        }
                    } catch (error) {
                        console.error('Failed to update user score:', error);
                    }
                }
            } else if (result === 'lost') {
                document.getElementById('computerscore').textContent = `${++lost}`;
                if (lost === 7) {
                    on("CPU");
                    const jwtToken = localStorage.getItem('jwtToken');
                    const csrfToken = await getCSRFCookie(); 
                    try {
                        const response = await fetch(`/api/update-score?result=lost&gametype=rps&oppononent=cpu`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${jwtToken}`,
                                'X-CSRFToken': csrfToken
                            },
                        });
                        if (response.ok) {
                            await fetchLeaderboardData();
                            //console.log('User score updated successfully');
                        } else {
                            console.error('Failed to update user score');
                        }
                    } catch (error) {
                        console.error('Failed to update user score:', error);
                    }
                }
            }
        });
    });
}

async function on(winner) {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";

    const overtext = document.getElementById("overtext");
    let wontext = await translateKey("wontext");
    let losetext = await translateKey("losetext");


    if (winner === "You") 
        overtext.textContent = wontext;
    else if (winner === "CPU")        
        overtext.textContent = losetext;
}


function off() {
    won = 0;
    lost = 0;
    document.getElementById('playerscore').textContent = '0';
    document.getElementById('computerscore').textContent = '0';
    document.getElementById("overlay").style.display = "none";
    document.getElementById('c-rock').style.backgroundColor = "black";
    document.getElementById('c-paper').style.backgroundColor = "black";
    document.getElementById('c-scissors').style.backgroundColor = "black";
}

let won = 0;
let lost = 0;
