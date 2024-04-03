function showPlayer3d1Page(){
    console.log("pong 3d1 page");
    let container;
    let renderer, scene, camera;
    let ball, paddle1, paddle2, mainLight;
    let WIDTH = 700, HEIGHT = 500;
    let FIELD_WIDTH = 1200, FIELD_LENGTH = 3000;

    function init() {
        container = document.getElementById('container');
        scene = new THREE.Scene();
        setupRenderer();
        setupCamera();
        addLights();
        addObjects();
        window.addEventListener('mousemove', handleMouseMove);
        render();
    }

    function setupRenderer() {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(WIDTH, HEIGHT);
        renderer.setClearColor(0x9999bb, 1);
        container.appendChild(renderer.domElement);
    }

    function setupCamera() {
        camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
        camera.position.set(0, 100, FIELD_LENGTH / 2 + 500);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    function addLights() {
        mainLight = new THREE.HemisphereLight(0xffffff, 0x003300);
        scene.add(mainLight);
    }

    function addObjects() {
        const fieldGeometry = new THREE.BoxGeometry(FIELD_WIDTH, 5, FIELD_LENGTH);
        const fieldMaterial = new THREE.MeshLambertMaterial({ color: 0x003300 });
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.position.set(0, -50, 0);
        scene.add(field);

        paddle1 = addPaddle(FIELD_LENGTH / 2);
        paddle2 = addPaddle(-FIELD_LENGTH / 2);

        const ballGeometry = new THREE.SphereGeometry(20, 16, 16);
        const ballMaterial = new THREE.MeshLambertMaterial({ color: 0xcc0000 });
        ball = new THREE.Mesh(ballGeometry, ballMaterial);
        scene.add(ball);
    }

    function addPaddle(zPosition) {
        const paddleGeometry = new THREE.BoxGeometry(200, 30, 10);
        const paddleMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        paddle.position.z = zPosition;
        scene.add(paddle);
        return paddle;
    }

    function handleMouseMove(event) {
        var mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        paddle1.position.x = THREE.MathUtils.lerp(-FIELD_WIDTH / 2, FIELD_WIDTH / 2, mouseX + 0.5);
    }

    function render() {
        requestAnimationFrame(render);
        // Spiellogik-Updates hier einfügen
        renderer.render(scene, camera);
    }

    init();
    };