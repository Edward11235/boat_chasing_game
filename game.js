document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas(); // Initial resize

    window.addEventListener('resize', resizeCanvas); // Resize when window size changes

    const boatSize = 45; // Adjusted boat size for clarity
    const deltaTime = 0.01; // Simulation time step

    // Two boats: police (player 1) and thief (player 2)
    let boats = {
        police: {x: 50, y: 50, yaw: 0, velocity: {x: 0, y: 0, yaw: 0}, color: 'red'},
        thief: {x: canvas.width - 50, y: canvas.height - 50, yaw: 0, velocity: {x: 0, y: 0, yaw: 0}, color: 'blue'}
    };

    const controlInput = {
        police: {surge: 0, sway: 0, yaw: 0},
        thief: {surge: 0, sway: 0, yaw: 0}
    };

    const mass = {x: 12, y: 12, yaw: 1.5};
    const damping = {x: 6, y: 6, yaw: 1.35};

    let policeScore = 0;
    let thiefScore = 0;
    let gameTimer = 60;
    let gameInterval;

    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            // Police controls
            case 'e': controlInput.police.surge = 10; break;
            case 'q': controlInput.police.surge = -10; break;
            case 'w': controlInput.police.sway = 10; break;
            case 's': controlInput.police.sway = -10; break;
            case 'a': controlInput.police.yaw = -10; break;
            case 'd': controlInput.police.yaw = 10; break;
            // Thief controls
            case '6': controlInput.thief.surge = 10; break;
            case '4': controlInput.thief.surge = -10; break;
            case '5': controlInput.thief.sway = 10; break;
            case '2': controlInput.thief.sway = -10; break;
            case '1': controlInput.thief.yaw = -10; break;
            case '3': controlInput.thief.yaw = 10; break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch(e.key) {
            // Reset police controls
            case 'e': case 'q': controlInput.police.surge = 0; break;
            case 'w': case 's': controlInput.police.sway = 0; break;
            case 'a': case 'd': controlInput.police.yaw = 0; break;
            // Reset thief controls
            case '4': case '6': controlInput.thief.surge = 0; break;
            case '5': case '2': controlInput.thief.sway = 0; break;
            case '1': case '3': controlInput.thief.yaw = 0; break;
        }
    });

    function updatePhysics(boat, controlInput) {
        let forces = {
            x: controlInput.surge * Math.cos(boat.yaw) + controlInput.sway * Math.sin(boat.yaw),
            y: controlInput.surge * Math.sin(boat.yaw) - controlInput.sway * Math.cos(boat.yaw),
            yaw: controlInput.yaw
        };

        boat.velocity.x += (forces.x - damping.x * boat.velocity.x) / mass.x * deltaTime;
        boat.velocity.y += (forces.y - damping.y * boat.velocity.y) / mass.y * deltaTime;
        boat.velocity.yaw += (forces.yaw - damping.yaw * boat.velocity.yaw) / mass.yaw * deltaTime;

        boat.x += boat.velocity.x * deltaTime * 100;
        boat.y += boat.velocity.y * deltaTime * 100;
        boat.yaw += boat.velocity.yaw * deltaTime;
    }

    function drawBoat(boat) {
        ctx.save();
        ctx.translate(boat.x, boat.y);
        ctx.rotate(boat.yaw);

        ctx.fillStyle = boat.color;
        ctx.fillRect(-boatSize / 2, -boatSize / 2, boatSize, boatSize);

        ctx.beginPath();
        ctx.moveTo(0, -boatSize / 2);
        ctx.lineTo(-10, -boatSize / 4);
        ctx.lineTo(10, -boatSize / 4);
        ctx.closePath();
        ctx.fillStyle = 'yellow';
        ctx.fill();

        ctx.restore();
    }

    function checkCollision() {
        let dx = boats.police.x - boats.thief.x;
        let dy = boats.police.y - boats.thief.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < boatSize) {
            policeScore += 1;
            resetGame();
        }
    }

    function drawScore() {
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(`Police Score: ${policeScore} | Thief Score: ${thiefScore}`, 10, 30);
    }

    function resetGame() {
        clearInterval(gameInterval);
        boats.police.x = 50;
        boats.police.y = 50;
        boats.thief.x = canvas.width - 50;
        boats.thief.y = canvas.height - 50;
        boats.police.velocity = {x: 0, y: 0, yaw: 0};
        boats.thief.velocity = {x: 0, y: 0, yaw: 0};
        gameTimer = 60;
        startGame();
    }

    function updateGameTimer() {
        if (gameTimer <= 0) {
            thiefScore += 1;
            resetGame();
        } else {
            gameTimer -= deltaTime;
        }
    }

    function gameLoop() {
        updatePhysics(boats.police, controlInput.police);
        updatePhysics(boats.thief, controlInput.thief);

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for redrawing

        drawBoat(boats.police);
        drawBoat(boats.thief);
        checkCollision();
        drawScore();
        updateGameTimer();
    }

    function startGame() {
        gameInterval = setInterval(gameLoop, deltaTime * 1000); // Adjust to real time
    }

    startGame();
});

