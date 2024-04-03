function showPlayersRemote2(){
    console.log("pong remote2 page");
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    
    let ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        velocityX: 5,
        velocityY: 5,
        speed: 7,
        color: "#fff"
    };

    let player = {
        x: 0, // links vom Canvas
        y: (canvas.height - 100) / 2, // -100 ist die Höhe des Schlägers
        width: 10,
        height: 100,
        score: 0,
        color: "#fff"
    };

    let computer = {
        x: canvas.width - 10, // rechts vom Canvas
        y: (canvas.height - 100) / 2, // -100 ist die Höhe des Schlägers
        width: 10,
        height: 100,
        score: 0,
        color: "#fff"
    };

    const drawRect = (x, y, w, h, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    };

    const drawArc = (x, y, r, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
    };

    const resetBall = () => {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.velocityX = -ball.velocityX;
        ball.speed = 7;
    };

    const update = () => {
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;

        let computerLevel = 0.1;
        computer.y += (ball.y - (computer.y + computer.height / 2)) * computerLevel;
        
        if(ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
            ball.velocityY = -ball.velocityY;
        }

        let playerOrComputer = (ball.x < canvas.width / 2) ? player : computer;
        if(collision(ball, playerOrComputer)) {
            let collidePoint = (ball.y - (playerOrComputer.y + playerOrComputer.height / 2));
            collidePoint = collidePoint / (playerOrComputer.height / 2);
            
            let angleRad = (Math.PI / 4) * collidePoint;
            
            let direction = (ball.x < canvas.width / 2) ? 1 : -1;
            ball.velocityX = direction * ball.speed * Math.cos(angleRad);
            ball.velocityY = ball.speed * Math.sin(angleRad);
            
            ball.speed += 0.1;
        }

        if(ball.x - ball.radius < 0) {
            computer.score++;
            resetBall();
        } else if(ball.x + ball.radius > canvas.width) {
            player.score++;
            resetBall();
        }
    };

    const collision = (b, p) => {
        b.top = b.y - b.radius;
        b.bottom = b.y + b.radius;
        b.left = b.x - b.radius;
        b.right = b.x + b.radius;
        
        p.top = p.y;
        p.bottom = p.y + p.height;
        p.left = p.x;
        p.right = p.x + p.width;
        
        return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
    };

    const render = () => {
        drawRect(0, 0, canvas.width, canvas.height, '#000');
        drawRect(player.x, player.y, player.width, player.height, player.color);
        drawRect(computer.x, computer.y, computer.width, computer.height, computer.color);
        drawArc(ball.x, ball.y, ball.radius, ball.color);
    };

    const game = () => {
        update();
        render();
    };

    const framePerSecond = 50;
    setInterval(game, 1000 / framePerSecond);
    };