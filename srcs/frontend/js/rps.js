function playRound(playerSelection, computerSelection)
{
    if ((playerSelection === "rock" && computerSelection === "rock")
        || (playerSelection === "paper" && computerSelection === "paper")
        || (playerSelection === "scissors" && computerSelection === "scissors"))
        return "drew";
    else if ((playerSelection === "rock" && computerSelection === "scissors")
        || (playerSelection === "paper" && computerSelection === "rock")
        || (playerSelection === "scissors" && computerSelection === "paper"))
        return "won";
    else if ((playerSelection === "rock" && computerSelection === "paper")
        || (playerSelection === "paper" && computerSelection === "scissors")
        || (playerSelection === "scissors" && computerSelection === "rock"))
        return "lost";
}

function getComputerChoice(){
    let num = Math.floor(Math.random() * 3)
    if (num === 0)
        return "rock"
    else if (num === 1)
        return "paper"
    else
        return "scissors"
}

function playRPS() {
    const container = document.querySelector(".rps-player-block");

    container.querySelectorAll('.select').forEach(button => {
        button.addEventListener('click', function() {
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
                document.getElementById('playerscore').textContent = `Score: ${++won}`;
                if (won === 5) {
                    on("You")

                }
            } else if (result === 'lost') {
                document.getElementById('computerscore').textContent = `Score: ${++lost}`;
                if (lost === 5) {
                    on("CPU")
                }
            }

        });
    });
}

function on(winner) {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("overtext").textContent = winner + " WON";
    document.getElementById("overtxt").textContent = "PLAY AGAIN";

    }

function off() {
    won = 0;
    lost = 0;
    document.getElementById('playerscore').textContent = 'Score: 0';
    document.getElementById('computerscore').textContent = 'Score: 0';
    document.getElementById("overlay").style.display = "none";
    document.getElementById('c-rock').style.backgroundColor = "black";
    document.getElementById('c-paper').style.backgroundColor = "black";
    document.getElementById('c-scissors').style.backgroundColor = "black";
}


let won = 0;
let lost = 0;


