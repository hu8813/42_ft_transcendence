function showPlayer3d1Page() {
    let score1 = 0;
    let score2 = 0;
    const scores3dElement = document.getElementById("scores3d");
    const winnerBoardElement = document.getElementById("winnerBoard");
    let renderer, scene, camera, pointLight, spotLight;
    const fieldWidth = 400, fieldHeight = 250;
    let paddleDepth, paddleQuality;
    let paddle1DirY = 0, paddle2DirY = 0, paddleSpeed = 5;
    const paddleWidth = 10, paddleHeight = 30;
    let ball, paddle1, paddle2;
    let ballDirX = 1, ballDirY = 1, ballSpeed = 3;
    let maxScore = 7;
    const Key = {
        _pressed: {},
        LEFT_ARROW: 37,
        RIGHT_ARROW: 39,
        isDown: function (keyCode) {
            return this._pressed[keyCode];
        },
        onKeydown: function (keyCode) {
            this._pressed[keyCode] = true;
        },
        onKeyup: function (keyCode) {
            delete this._pressed[keyCode];
        }
    };
    document.getElementById('moveLeftButton').addEventListener('touchstart', function () {
        Key.onKeydown(Key.LEFT_ARROW);
    });
    document.getElementById('moveLeftButton').addEventListener('mousedown', function () {
        Key.onKeydown(Key.LEFT_ARROW);
    });
    document.getElementById('moveLeftButton').addEventListener('touchend', function () {
        Key.onKeyup(Key.LEFT_ARROW);
    });
    document.getElementById('moveLeftButton').addEventListener('mouseup', function () {
        Key.onKeyup(Key.LEFT_ARROW);
    });
    document.getElementById('moveLeftButton').addEventListener('click', function () {
        Key.onKeyup(Key.LEFT_ARROW);
    });
    document.getElementById('moveRightButton').addEventListener('touchstart', function () {
        Key.onKeydown(Key.RIGHT_ARROW);
    });
    document.getElementById('moveRightButton').addEventListener('mousedown', function () {
        Key.onKeydown(Key.RIGHT_ARROW);
    });
    document.getElementById('moveRightButton').addEventListener('touchend', function () {
        Key.onKeyup(Key.RIGHT_ARROW);
    });
    document.getElementById('moveRightButton').addEventListener('mouseup', function () {
        Key.onKeyup(Key.RIGHT_ARROW);
    });
    document.getElementById('moveRightButton').addEventListener('click', function () {
        Key.onKeyup(Key.RIGHT_ARROW);
    });
    let instructionsModal = document.getElementById("instructionsModal");
    let startGameButton = document.getElementById("startGameButton");
    showInstructions();
    startGameButton.addEventListener("click", function () {
        instructionsModal.style.display = "none";
        setup();
    });
    
    instructionsModal.style.display = "block";
    document.getElementById("instructions3d").style.display = "block !important";
    function showInstructions() {
        instructionsModal.style.display = "block !important" ;
        document.getElementById("instructions3d").style.display = "bloc! important";
        // const closeBtn = instructionsModal.querySelector(".close");
        // closeBtn.addEventListener("click", function () {
        //     instructionsModal.style.display = "block";
        //     setup();
        // });
        // window.onclick = function(event) {
        //     if (event.target == instructionsModal) {
        //         instructionsModal.style.display = "block !important";
        //         setup();
        //     }
        // };
    }
    function draw() {
        renderer.render(scene, camera);
        requestAnimationFrame(draw);
        ballPhysics();
        paddlePhysics();
        cameraPhysics();
        playerPaddleMovement();
        opponentPaddleMovement();
    }
    function setup() {
        startGameButton.style.display = "none";
        if (winnerBoardElement)
            winnerBoardElement.innerHTML = " &nbsp; Reach " + maxScore + " points to win!";
        score1 = 0;
        score2 = 0;
        createScene();
        draw();
    }
    function createScene() {
        const WIDTH = 950, HEIGHT = 480;
        const c = document.getElementById("gameCanvas3d");
        renderer = new THREE.WebGLRenderer();
        camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 1, 1000);
        scene = new THREE.Scene();
        scene.add(camera);
        renderer.setSize(WIDTH, HEIGHT);
        c.appendChild(renderer.domElement);
        const planeWidth = fieldWidth, planeHeight = fieldHeight, planeQuality = 10;
        const paddle1Material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        const paddle2Material = new THREE.MeshLambertMaterial({ color: 0x550055 });
        const planeMaterial = new THREE.MeshLambertMaterial({ color: 0x2D4329 });
        const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x1A2A1A });
// CONTROLS //
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.update();

// CONTROLS //
  const lineWidth = 1;
  const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

  const centerLine = new THREE.Mesh(new THREE.BoxGeometry(fieldWidth, lineWidth, lineWidth),lineMaterial);
  centerLine.position.z = lineWidth / 2;
  scene.add(centerLine);

  const sideLineLeft = new THREE.Mesh(new THREE.BoxGeometry(lineWidth, fieldHeight, lineWidth),lineMaterial);
  sideLineLeft.position.x = -fieldWidth / 2 + lineWidth / 2;
  scene.add(sideLineLeft);

const sideLineRight = new THREE.Mesh(new THREE.BoxGeometry(lineWidth, fieldHeight, lineWidth), lineMaterial);
sideLineRight.position.x = fieldWidth / 2 - lineWidth / 2;
scene.add(sideLineRight);

const textureLoader = new THREE.TextureLoader();
const groundMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load('../src/ground.jpg') });
const plane = new THREE.Mesh(new THREE.PlaneGeometry(planeWidth * 0.95, planeHeight, planeQuality, planeQuality),planeMaterial);
const bgLoader = new THREE.TextureLoader(); 
scene.background = bgLoader.load('../src/tt.jpg');
scene.add(plane);
plane.receiveShadow = true;
const table = new THREE.Mesh(new THREE.BoxGeometry(planeWidth * 1.05, planeHeight * 1.03, 100, planeQuality, planeQuality,1),tableMaterial);
table.position.z = -51;
scene.add(table);
table.receiveShadow = true;

const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xD43001 });
ball = new THREE.Mesh(new THREE.SphereGeometry(5, 6, 6),sphereMaterial);
scene.add(ball);
ball.position.x = 0;
ball.position.y = 0;
ball.position.z = 5;
ball.receiveShadow = true;
ball.castShadow = true;

paddleDepth = 10;
paddleQuality = 10;
paddle1 = new THREE.Mesh(new THREE.BoxGeometry(paddleWidth,paddleHeight,paddleDepth,paddleQuality,paddleQuality,paddleQuality),paddle1Material);
scene.add(paddle1);
paddle1.receiveShadow = true;
paddle1.castShadow = true;
paddle2 = new THREE.Mesh(new THREE.BoxGeometry(paddleWidth,paddleHeight,paddleDepth,paddleQuality,paddleQuality,paddleQuality),paddle2Material);
scene.add(paddle2);
paddle2.receiveShadow = true;
paddle2.castShadow = true;
paddle1.position.x = -fieldWidth / 2 + paddleWidth;
paddle2.position.x = fieldWidth / 2 - paddleWidth;
paddle1.position.z = paddleDepth;
paddle2.position.z = paddleDepth;
const ground = new THREE.Mesh(new THREE.BoxGeometry(1000,1000,3,1,1,1),groundMaterial);
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
        spotLight.angle = 0.5;
        spotLight.castShadow = true;
        scene.add(spotLight);
        renderer.shadowMap.enabled = true;
    }

    async function ballPhysics() {
        if (ball.position.x <= -fieldWidth / 2) {
            score2++;
            ballDirX = Math.abs(ballDirX);

            if (scores3dElement) {
                scores3dElement.innerHTML = score1 + "-" + score2;
            }
            resetBall(2);
            await matchScoreCheck();
        }
        if (ball.position.x >= fieldWidth / 2) {
            score1++;
            ballDirX = -Math.abs(ballDirX);
            if (scores3dElement)
                scores3dElement.innerHTML = score1 + "-" + score2;
            resetBall(1);
            await matchScoreCheck();
        }
        if (ball.position.y <= -fieldHeight / 2) {
            ballDirY = Math.abs(ballDirY);
        }
        if (ball.position.y >= fieldHeight / 2) {
            ballDirY = -Math.abs(ballDirY);
        }
        ball.position.x += ballDirX * ballSpeed;
        ball.position.y += ballDirY * ballSpeed;
        if (ballDirY > ballSpeed * 2) {
            ballDirY = ballSpeed * 2;
        }
        else if (ballDirY < -ballSpeed * 2) {
            ballDirY = -ballSpeed * 2;
        }
    }

    function opponentPaddleMovement() {
        const opponentSpeedFactor = 0.5; 
        const targetPosition = ball.position.y;
        const distanceToTarget = targetPosition - paddle2.position.y;
        const maxMovement = paddleSpeed * opponentSpeedFactor;
        let actualMovement = Math.min(Math.abs(distanceToTarget), maxMovement);
        actualMovement *= (Math.random() * 0.5 + 0.75); 
        const direction = Math.sign(distanceToTarget);
        paddle2.position.y += actualMovement * direction;
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

    function cameraPhysics() {
        camera.position.x = paddle1.position.x - 130;
        camera.position.z = paddle1.position.z + 100;
        camera.rotation.y = -70 * Math.PI / 180;
        camera.rotation.z = -90 * Math.PI / 180;
    }

    function paddlePhysics() {
        if (ball.position.x <= paddle1.position.x + paddleWidth &&
            ball.position.x >= paddle1.position.x) {
            if (ball.position.y <= paddle1.position.y + paddleHeight / 2 &&
                ball.position.y >= paddle1.position.y - paddleHeight / 2) {
                if (ballDirX < 0) {
                    ballDirX = -ballDirX;
                    ballDirY -= paddle1DirY * 0.7;
                }
            }
        }
        if (ball.position.x <= paddle2.position.x + paddleWidth &&
            ball.position.x >= paddle2.position.x) {
            if (ball.position.y <= paddle2.position.y + paddleHeight / 2 &&
                ball.position.y >= paddle2.position.y - paddleHeight / 2) {
                if (ballDirX > 0) {
                    ballDirX = -ballDirX;
                    ballDirY -= paddle2DirY * 0.7;
                }
            }
        }
    }

    function resetBall(loser) {
        ball.position.x = 0;
        ball.position.y = 0;
        if (loser == 1) {
            ballDirX = -1;
        }
        else {
            ballDirX = 1;
        }
        ballDirY = 1;
    }
    var bounceTime = 0;
    async function matchScoreCheck() {
        let gameResult;
        let message;
        let cpuwins = await translateKey("cpuwins");  
        let playwins = await translateKey("playwins");  
        if (score1 >= maxScore) {
            ballSpeed = 0;
            gameResult = 'win';
            message = playwins;
            bounceTime++;
            paddle1.position.z = Math.sin(bounceTime * 0.1) * 10;
        } else if (score2 >= maxScore) {
            ballSpeed = 0;
            gameResult = 'lost';
            message = cpuwins;
            bounceTime++;
            paddle2.position.z = Math.sin(bounceTime * 0.1) * 10;
        }
    
        if (gameResult) {
            if (scores3dElement)
                scores3dElement.innerHTML = message;
    
            if (winnerBoardElement) {
                let refresh = await translateKey("refresh");  
                winnerBoardElement.style.display = "block";
                winnerBoardElement.innerHTML = refresh;
                startGameButton.style.display = "block";
                startGameButton.innerHTML = "Play Again";
                startGameButton.addEventListener("click", function () {
                    location.reload();
                });
            }
    
            const jwtToken = localStorage.getItem('jwtToken');
            const csrfToken = await getCSRFCookie(); 
            try {
                const response = await fetch(`/api/update-score?result=${gameResult}&gametype=pong&oppononent=cpu`, {
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
    
    window.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') {
            Key.onKeydown(Key.LEFT_ARROW);
        } else if (event.key === 'ArrowRight') {
            Key.onKeydown(Key.RIGHT_ARROW);
        }
    });
    window.addEventListener('keyup', function (event) {
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

    //setup();
};