function showPlayer3d1Page(){
    console.log("pong 3d1 page");
    var score1 = 0;
    var score2 = 0;    

const scores3dElement = document.getElementById("scores3d");
const winnerBoardElement = document.getElementById("winnerBoard");

var renderer, scene, camera, pointLight, spotLight;


var fieldWidth = 400, fieldHeight = 200;


var paddleWidth, paddleHeight, paddleDepth, paddleQuality;
var paddle1DirY = 0, paddle2DirY = 0, paddleSpeed = 5;


var ball, paddle1, paddle2;
var ballDirX = 1, ballDirY = 1, ballSpeed = 3;


var score1 = 0, score2 = 0;

var maxScore = 7;


var difficulty = 0.8;



var Key = {
    _pressed: {},
  
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    
    isDown: function(keyCode) {
      return this._pressed[keyCode];
    },
    
    onKeydown: function(keyCode) {
      this._pressed[keyCode] = true;
    },
    
    onKeyup: function(keyCode) {
      delete this._pressed[keyCode];
    }
  };


document.getElementById('moveLeftButton').addEventListener('touchstart', function() {
    Key.onKeydown(Key.LEFT_ARROW);
});

document.getElementById('moveLeftButton').addEventListener('mousedown', function() {
    Key.onKeydown(Key.LEFT_ARROW);
});

document.getElementById('moveLeftButton').addEventListener('touchend', function() {
    Key.onKeyup(Key.LEFT_ARROW);
});

document.getElementById('moveLeftButton').addEventListener('mouseup', function() {
    Key.onKeyup(Key.LEFT_ARROW);
});

document.getElementById('moveLeftButton').addEventListener('click', function() {
    Key.onKeyup(Key.LEFT_ARROW);
});


document.getElementById('moveRightButton').addEventListener('touchstart', function() {
    Key.onKeydown(Key.RIGHT_ARROW);
});

document.getElementById('moveRightButton').addEventListener('mousedown', function() {
    Key.onKeydown(Key.RIGHT_ARROW);
});

document.getElementById('moveRightButton').addEventListener('touchend', function() {
    Key.onKeyup(Key.RIGHT_ARROW);
});

document.getElementById('moveRightButton').addEventListener('mouseup', function() {
    Key.onKeyup(Key.RIGHT_ARROW);
});

document.getElementById('moveRightButton').addEventListener('click', function() {
    Key.onKeyup(Key.RIGHT_ARROW);
});


function setup()
{
	if (winnerBoardElement)
        winnerBoardElement.innerHTML = " &nbsp; Reach " + maxScore + " points to win!";
	
	
	score1 = 0;
	score2 = 0;
	
	
	createScene();
	
	
	draw();
}

function createScene() {
    
    var WIDTH = 950,
        HEIGHT = 480;

    
    var VIEW_ANGLE = 50,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;

    var c = document.getElementById("gameCanvas3d");

    
    
    renderer = new THREE.WebGLRenderer();
    camera =
        new THREE.PerspectiveCamera(
            VIEW_ANGLE,
            ASPECT,
            NEAR,
            FAR);

    scene = new THREE.Scene();

    
    scene.add(camera);

    
    
    camera.position.z = 320;

    
    renderer.setSize(WIDTH, HEIGHT);

    
    c.appendChild(renderer.domElement);

    
    var planeWidth = fieldWidth,
        planeHeight = fieldHeight,
        planeQuality = 10;

var paddle1Material =
    new THREE.MeshLambertMaterial({
        color: 0x0A0A0A 
    });

var paddle2Material =
    new THREE.MeshLambertMaterial({
        color: 0x550055 
    });


var planeMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x6495ED 
    });

var tableMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x8B4513 
    });

var pillarMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x8B4513 
    });

var groundMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x333333 
    });


    
    var plane = new THREE.Mesh(

        new THREE.PlaneGeometry(
            planeWidth * 0.95, 
            planeHeight,
            planeQuality,
            planeQuality),

        planeMaterial);
	scene.background = new THREE.Color(0x333333);
    scene.add(plane);
    plane.receiveShadow = true;

    var table = new THREE.Mesh(

        new THREE.BoxGeometry(
            planeWidth * 1.05, 
            planeHeight * 1.03,
            100, 
            planeQuality,
            planeQuality,
            1),

        tableMaterial);
    table.position.z = -51; 
    scene.add(table);
    table.receiveShadow = true;

    
    
    var radius = 5,
        segments = 6,
        rings = 6;

    
    var sphereMaterial =
        new THREE.MeshLambertMaterial({
            color: 0xD43001
        });

    
    ball = new THREE.Mesh(

        new THREE.SphereGeometry(
            radius,
            segments,
            rings),

        sphereMaterial);

    
    scene.add(ball);

    ball.position.x = 0;
    ball.position.y = 0;
    
    ball.position.z = radius;
    ball.receiveShadow = true;
    ball.castShadow = true;

    
    paddleWidth = 10;
    paddleHeight = 30;
    paddleDepth = 10;
    paddleQuality = 1;

    paddle1 = new THREE.Mesh(

        new THREE.BoxGeometry(
            paddleWidth,
            paddleHeight,
            paddleDepth,
            paddleQuality,
            paddleQuality,
            paddleQuality),

        paddle1Material);

    
    scene.add(paddle1);
    paddle1.receiveShadow = true;
    paddle1.castShadow = true;

    paddle2 = new THREE.Mesh(

        new THREE.BoxGeometry(
            paddleWidth,
            paddleHeight,
            paddleDepth,
            paddleQuality,
            paddleQuality,
            paddleQuality),

        paddle2Material);

    
    scene.add(paddle2);
    paddle2.receiveShadow = true;
    paddle2.castShadow = true;

    
    paddle1.position.x = -fieldWidth / 2 + paddleWidth;
    paddle2.position.x = fieldWidth / 2 - paddleWidth;

    
    paddle1.position.z = paddleDepth;
    paddle2.position.z = paddleDepth;

    
    
    
    var ground = new THREE.Mesh(

        new THREE.BoxGeometry(
            1000,
            1000,
            3,
            1,
            1,
            1),

        groundMaterial);
    
    ground.position.z = -132;
    ground.receiveShadow = true;
    scene.add(ground);

    
    pointLight =
        new THREE.PointLight(0xF8D898);

    
    pointLight.position.x = -1000;
    pointLight.position.y = 0;
    pointLight.position.z = 1000;
    pointLight.intensity = 2.9;
    pointLight.distance = 10000;
    
    scene.add(pointLight);

    
    
    spotLight = new THREE.SpotLight(0xF8D898);
    spotLight.position.set(0, 0, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    renderer.shadowMap.enabled = true;
}


function draw()
{	
	
	renderer.render(scene, camera);
	
	requestAnimationFrame(draw);
	
	ballPhysics();
	paddlePhysics();
	cameraPhysics();
	playerPaddleMovement();
	opponentPaddleMovement();
}

function ballPhysics()
{
	
	if (ball.position.x <= -fieldWidth/2)
	{	
		
		score2++;
		
		
    if (scores3dElement) {
        scores3dElement.innerHTML = score1 + "-" + score2;
    }
		
		resetBall(2);
		matchScoreCheck();	
	}
	
	
	if (ball.position.x >= fieldWidth/2)
	{	
		
		score1++;
		
        if (scores3dElement)
		    scores3dElement.innerHTML = score1 + "-" + score2;
		
		resetBall(1);
		matchScoreCheck();	
	}
	
	
	if (ball.position.y <= -fieldHeight/2)
	{
		ballDirY = -ballDirY;
	}	
	
	if (ball.position.y >= fieldHeight/2)
	{
		ballDirY = -ballDirY;
	}
	
	
	ball.position.x += ballDirX * ballSpeed;
	ball.position.y += ballDirY * ballSpeed;
	
	
	
	
	if (ballDirY > ballSpeed * 2)
	{
		ballDirY = ballSpeed * 2;
	}
	else if (ballDirY < -ballSpeed * 2)
	{
		ballDirY = -ballSpeed * 2;
	}
}


function opponentPaddleMovement()
{
	
	paddle2DirY = (ball.position.y - paddle2.position.y) * difficulty;
	
	
	if (Math.abs(paddle2DirY) <= paddleSpeed)
	{	
		paddle2.position.y += paddle2DirY;
	}
	
	else
	{
		
		if (paddle2DirY > paddleSpeed)
		{
			paddle2.position.y += paddleSpeed;
		}
		
		else if (paddle2DirY < -paddleSpeed)
		{
			paddle2.position.y -= paddleSpeed;
		}
	}
	
	
	
	
	paddle2.scale.y += (1 - paddle2.scale.y) * 0.2;	
}


function playerPaddleMovement() {
    if (Key.isDown(Key.LEFT_ARROW)) {
        
        if (paddle1.position.y < fieldHeight * 0.45) {
            paddle1DirY = paddleSpeed * 0.5;
        } else {
            paddle1DirY = 0;
        }
    } else if (Key.isDown(Key.RIGHT_ARROW)) {
        
        if (paddle1.position.y > -fieldHeight * 0.45) {
            paddle1DirY = -paddleSpeed * 0.5;
        } else {
            paddle1DirY = 0;
        }
    } else {
        paddle1DirY = 0;
    }
    
    
    paddle1.position.y += paddle1DirY;

    
    if (paddle1.position.y > fieldHeight * 0.45) {
        paddle1.position.y = fieldHeight * 0.45;
    } else if (paddle1.position.y < -fieldHeight * 0.45) {
        paddle1.position.y = -fieldHeight * 0.45;
    }

    
    paddle1.scale.y += (1 - paddle1.scale.y) * 0.2;
    paddle1.scale.z += (1 - paddle1.scale.z) * 0.2;
}

function cameraPhysics()
{
	
	spotLight.position.x = ball.position.x * 2;
	spotLight.position.y = ball.position.y * 2;
	
	
	camera.position.x = paddle1.position.x - 100;
	camera.position.y += (paddle1.position.y - camera.position.y) * 0.05;
	camera.position.z = paddle1.position.z + 100 + 0.04 * (-ball.position.x + paddle1.position.x);
	
	
	camera.rotation.x = -0.01 * (ball.position.y) * Math.PI/180;
	camera.rotation.y = -60 * Math.PI/180;
	camera.rotation.z = -90 * Math.PI/180;
}


function paddlePhysics()
{
	
	
	
	
	
	if (ball.position.x <= paddle1.position.x + paddleWidth
	&&  ball.position.x >= paddle1.position.x)
	{
		
		if (ball.position.y <= paddle1.position.y + paddleHeight/2
		&&  ball.position.y >= paddle1.position.y - paddleHeight/2)
		{
			
			if (ballDirX < 0)
			{
				
				paddle1.scale.y = 15;
				
				ballDirX = -ballDirX;
				
				
				
				ballDirY -= paddle1DirY * 0.7;
			}
		}
	}
	
	
	
	
	
	
	if (ball.position.x <= paddle2.position.x + paddleWidth
	&&  ball.position.x >= paddle2.position.x)
	{
		
		if (ball.position.y <= paddle2.position.y + paddleHeight/2
		&&  ball.position.y >= paddle2.position.y - paddleHeight/2)
		{
			
			if (ballDirX > 0)
			{
				
				paddle2.scale.y = 15;	
				
				ballDirX = -ballDirX;
				
				
				
				ballDirY -= paddle2DirY * 0.7;
			}
		}
	}
}

function resetBall(loser)
{
	
	ball.position.x = 0;
	ball.position.y = 0;
	
	
	if (loser == 1)
	{
		ballDirX = -1;
	}
	
	else
	{
		ballDirX = 1;
	}
	
	
	ballDirY = 1;
}

var bounceTime = 0;

function matchScoreCheck()
{
	
	if (score1 >= maxScore)
	{
		
		ballSpeed = 0;
		
        if (scores3dElement)
		    scores3dElement.innerHTML = "Player wins!";		
		if (winnerBoardElement)
            winnerBoardElement.innerHTML = "Refresh to play again";
		
		bounceTime++;
		paddle1.position.z = Math.sin(bounceTime * 0.1) * 10;
		
		paddle1.scale.z = 2 + Math.abs(Math.sin(bounceTime * 0.1)) * 10;
		paddle1.scale.y = 2 + Math.abs(Math.sin(bounceTime * 0.05)) * 10;
	}
	
	else if (score2 >= maxScore)
	{
		
		ballSpeed = 0;
		if (scores3dElement)
		    scores3dElement.innerHTML = "CPU wins!";
		if (winnerBoardElement)
            winnerBoardElement.innerHTML = "Refresh to play again";
		
		bounceTime++;
		paddle2.position.z = Math.sin(bounceTime * 0.1) * 10;
		
		paddle2.scale.z = 2 + Math.abs(Math.sin(bounceTime * 0.1)) * 10;
		paddle2.scale.y = 2 + Math.abs(Math.sin(bounceTime * 0.05)) * 10;
	}
}
    window.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            Key.onKeydown(Key.LEFT_ARROW);
        } else if (event.key === 'ArrowRight') {
            Key.onKeydown(Key.RIGHT_ARROW);
        }
    });

    window.addEventListener('keyup', function(event) {
        if (event.key === 'ArrowLeft') {
            Key.onKeyup(Key.LEFT_ARROW);
        } else if (event.key === 'ArrowRight') {
            Key.onKeyup(Key.RIGHT_ARROW);
        }
    });

    window.addEventListener("deviceorientation", handleOrientation, true);

    function handleOrientation(event) {
        var gamma = event.gamma;
        var paddleMovement = (gamma / 90) * 5;
        
        if (paddleMovement < 0) {
            Key.onKeydown(Key.LEFT_ARROW);
            Key.onKeyup(Key.RIGHT_ARROW);
        } else if (paddleMovement > 0) {
            Key.onKeydown(Key.RIGHT_ARROW);
            Key.onKeyup(Key.LEFT_ARROW);
        } else {
            Key.onKeyup(Key.LEFT_ARROW);
            Key.onKeyup(Key.RIGHT_ARROW);
        }
    }
    


    setup();

    };