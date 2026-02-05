// Game Variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bouncesElement = document.getElementById('bounces');
const timeElement = document.getElementById('time');
const livesElement = document.getElementById('lives');
const paddlePosElement = document.getElementById('paddlePos');
const gameStatusElement = document.getElementById('gameStatus');
const statusTextElement = document.querySelector('.status-text');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const soundToggle = document.getElementById('soundToggle');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

// Game State
let game = {
    score: 0,
    bounces: 0,
    time: 60,
    lives: 3,
    isRunning: false,
    isPaused: false,
    soundOn: true,
    difficulty: 'medium',
    ballSpeed: 5,
    paddleSpeed: 8
};

// Ball Properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    dx: 0,
    dy: 0,
    speed: 5,
    color: '#FF416C',
    trail: []
};

// Paddle Properties
const paddle = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 20,
    width: 120,
    height: 15,
    color: '#06D6A0',
    speed: 8
};

// Bricks/Obstacles
const bricks = [];
const brickRows = 3;
const brickCols = 8;
const brickWidth = 70;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 35;

// Initialize bricks
function initBricks() {
    bricks.length = 0;
    for (let c = 0; c < brickCols; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRows; r++) {
            bricks[c][r] = {
                x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                y: r * (brickHeight + brickPadding) + brickOffsetTop,
                width: brickWidth,
                height: brickHeight,
                color: `hsl(${c * 30 + r * 40}, 70%, 60%)`,
                visible: true
            };
        }
    }
}

// Initialize game
function initGame() {
    // Reset game state
    game.score = 0;
    game.bounces = 0;
    game.time = 60;
    game.lives = 3;
    game.isRunning = false;
    game.isPaused = false;
    
    // Reset ball
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
    ball.trail = [];
    
    // Reset paddle
    paddle.x = canvas.width / 2 - paddle.width / 2;
    
    // Initialize bricks
    initBricks();
    
    // Update UI
    updateUI();
    showGameStatus("READY TO PLAY", true);
}

// Set difficulty
function setDifficulty(level) {
    game.difficulty = level;
    
    // Update active button
    difficultyButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.level === level) {
            btn.classList.add('active');
        }
    });
    
    // Adjust game parameters based on difficulty
    switch(level) {
        case 'easy':
            ball.speed = 4;
            paddle.speed = 6;
            break;
        case 'medium':
            ball.speed = 5;
            paddle.speed = 8;
            break;
        case 'hard':
            ball.speed = 7;
            paddle.speed = 10;
            break;
    }
    
    // If game is running, update ball speed
    if (game.isRunning && ball.dx !== 0) {
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = (ball.dx / speed) * ball.speed;
        ball.dy = (ball.dy / speed) * ball.speed;
    }
}

// Update UI
function updateUI() {
    scoreElement.textContent = game.score;
    bouncesElement.textContent = game.bounces;
    timeElement.textContent = `${game.time}s`;
    
    // Update lives display
    const lifeIcons = document.querySelectorAll('.life');
    lifeIcons.forEach((icon, index) => {
        if (index < game.lives) {
            icon.style.color = '#FF416C';
            icon.classList.remove('fa-heart-broken');
            icon.classList.add('fa-heart');
        } else {
            icon.style.color = '#555';
            icon.classList.remove('fa-heart');
            icon.classList.add('fa-heart-broken');
        }
    });
    
    // Update paddle position display
    const paddlePercent = Math.round((paddle.x / (canvas.width - paddle.width)) * 100);
    paddlePosElement.textContent = `${paddlePercent}%`;
}

// Show game status
function showGameStatus(text, showButton = false) {
    statusTextElement.textContent = text;
    gameStatusElement.style.display = 'flex';
    startBtn.style.display = showButton ? 'flex' : 'none';
    
    if (text === "GAME OVER") {
        statusTextElement.style.color = "#FF416C";
    } else if (text === "PAUSED") {
        statusTextElement.style.color = "#FFD166";
    } else {
        statusTextElement.style.color = "#06D6A0";
    }
}

// Hide game status
function hideGameStatus() {
    gameStatusElement.style.display = 'none';
}

// Draw ball with trail effect
function drawBall() {
    // Draw trail
    for (let i = 0; i < ball.trail.length; i++) {
        const alpha = i / ball.trail.length * 0.5;
        ctx.beginPath();
        ctx.arc(ball.trail[i].x, ball.trail[i].y, ball.radius * (i / ball.trail.length), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 65, 108, ${alpha})`;
        ctx.fill();
        ctx.closePath();
    }
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    
    // Create gradient for ball
    const gradient = ctx.createRadialGradient(
        ball.x - 5, ball.y - 5, 1,
        ball.x, ball.y, ball.radius
    );
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.5, ball.color);
    gradient.addColorStop(1, '#B0003A');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add shine effect
    ctx.beginPath();
    ctx.arc(ball.x - ball.radius/3, ball.y - ball.radius/3, ball.radius/4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    ctx.closePath();
    
    // Update trail
    ball.trail.unshift({x: ball.x, y: ball.y});
    if (ball.trail.length > 10) {
        ball.trail.pop();
    }
}

// Draw paddle
function drawPaddle() {
    // Draw paddle shadow
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y + 3, paddle.width, paddle.height, 10);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
    
    // Draw paddle
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 10);
    
    // Create gradient for paddle
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, '#06D6A0');
    gradient.addColorStop(1, '#118AB2');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.closePath();
}

// Draw bricks
function drawBricks() {
    for (let c = 0; c < brickCols; c++) {
        for (let r = 0; r < brickRows; r++) {
            const brick = bricks[c][r];
            if (brick.visible) {
                // Draw brick shadow
                ctx.beginPath();
                ctx.roundRect(brick.x + 2, brick.y + 2, brick.width, brick.height, 5);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fill();
                
                // Draw brick
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.width, brick.height, 5);
                
                // Create gradient for brick
                const gradient = ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
                gradient.addColorStop(0, brick.color);
                gradient.addColorStop(1, darkenColor(brick.color, 40));
                
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Helper function to darken a color
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    
    return `#${(
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1)}`;
}

// Draw game elements
function draw() {
    // Clear canvas with a subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#111122');
    gradient.addColorStop(1, '#0A0A1A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid pattern in background
    drawGrid();
    
    // Draw game elements
    drawBricks();
    drawBall();
    drawPaddle();
    
    // Draw score on canvas
    ctx.font = 'bold 20px Orbitron';
    ctx.fillStyle = '#FFD166';
    ctx.fillText(`SCORE: ${game.score}`, 20, 30);
    ctx.fillText(`BOUNCES: ${game.bounces}`, 20, 60);
}

// Draw grid background
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Launch ball
function launchBall() {
    if (ball.dx === 0 && ball.dy === 0) {
        // Set random direction
        const angle = (Math.random() * Math.PI / 2) + Math.PI / 4; // 45 to 135 degrees
        ball.dx = Math.cos(angle) * ball.speed;
        ball.dy = Math.sin(angle) * ball.speed;
        
        // Play sound if enabled
        if (game.soundOn) {
            playSound('launch');
        }
    }
}

// Update game state
function update() {
    if (!game.isRunning || game.isPaused) return;
    
    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Ball collision with walls
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
        if (game.soundOn) playSound('bounce');
    }
    
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
        if (game.soundOn) playSound('bounce');
    }
    
    // Ball collision with paddle
    if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.dy > 0
    ) {
        // Calculate bounce angle based on where the ball hits the paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = hitPos * Math.PI * 0.75 + Math.PI * 0.125; // 22.5 to 157.5 degrees
        
        ball.dx = Math.cos(angle) * ball.speed;
        ball.dy = -Math.sin(angle) * ball.speed;
        
        game.bounces++;
        game.score += 10;
        
        if (game.soundOn) playSound('paddle');
        
        // Add visual feedback
        paddle.color = '#FFD166';
        setTimeout(() => {
            paddle.color = '#06D6A0';
        }, 100);
    }
    
    // Ball collision with bricks
    for (let c = 0; c < brickCols; c++) {
        for (let r = 0; r < brickRows; r++) {
            const brick = bricks[c][r];
            if (brick.visible) {
                if (
                    ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.height
                ) {
                    // Determine collision side
                    const ballLeft = ball.x - ball.radius;
                    const ballRight = ball.x + ball.radius;
                    const ballTop = ball.y - ball.radius;
                    const ballBottom = ball.y + ball.radius;
                    
                    const brickLeft = brick.x;
                    const brickRight = brick.x + brick.width;
                    const brickTop = brick.y;
                    const brickBottom = brick.y + brick.height;
                    
                    // Check which side was hit
                    const fromLeft = ballRight - brickLeft;
                    const fromRight = brickRight - ballLeft;
                    const fromTop = ballBottom - brickTop;
                    const fromBottom = brickBottom - ballTop;
                    
                    // Find the minimum penetration
                    const min = Math.min(fromLeft, fromRight, fromTop, fromBottom);
                    
                    // Reverse direction based on collision side
                    if (min === fromLeft || min === fromRight) {
                        ball.dx = -ball.dx;
                    } else {
                        ball.dy = -ball.dy;
                    }
                    
                    brick.visible = false;
                    game.score += 50;
                    
                    if (game.soundOn) playSound('brick');
                }
            }
        }
    }
    
    // Ball falls below paddle
    if (ball.y - ball.radius > canvas.height) {
        game.lives--;
        
        if (game.lives <= 0) {
            game.isRunning = false;
            showGameStatus("GAME OVER");
            if (game.soundOn) playSound('gameover');
        } else {
            // Reset ball position
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.dx = 0;
            ball.dy = 0;
            ball.trail = [];
            
            if (game.soundOn) playSound('lose');
        }
    }
    
    // Update UI
    updateUI();
}

// Game loop
function gameLoop() {
    update();
    draw();
    
    // Continue game loop
    if (game.isRunning && !game.isPaused) {
        requestAnimationFrame(gameLoop);
    }
}

// Timer function
function startTimer() {
    const timer = setInterval(() => {
        if (game.isRunning && !game.isPaused) {
            game.time--;
            updateUI();
            
            if (game.time <= 0) {
                game.isRunning = false;
                showGameStatus("TIME'S UP!");
                clearInterval(timer);
            }
        }
        
        if (!game.isRunning) {
            clearInterval(timer);
        }
    }, 1000);
}

// Play sound effects (using Web Audio API)
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency = 440;
        let duration = 0.1;
        
        switch(type) {
            case 'launch':
                frequency = 523.25; // C5
                break;
            case 'bounce':
                frequency = 659.25; // E5
                break;
            case 'paddle':
                frequency = 783.99; // G5
                break;
            case 'brick':
                frequency = 1046.50; // C6
                break;
            case 'lose':
                frequency = 220; // A3
                duration = 0.3;
                break;
            case 'gameover':
                frequency = 174.61; // F3
                duration = 0.5;
                break;
        }
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log("Audio context not supported");
    }
}

// Mouse movement handler
canvas.addEventListener('mousemove', (e) => {
    if (!game.isRunning || game.isPaused) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Move paddle to mouse position
    paddle.x = mouseX - paddle.width / 2;
    
    // Keep paddle within canvas
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            if (game.isRunning && !game.isPaused) {
                launchBall();
            }
            break;
        case 'KeyR':
            initGame();
            break;
        case 'KeyP':
            togglePause();
            break;
    }
});

// Start game
function startGame() {
    game.isRunning = true;
    game.isPaused = false;
    hideGameStatus();
    startTimer();
    gameLoop();
    
    // Launch ball after a short delay
    setTimeout(() => {
        launchBall();
    }, 500);
}

// Toggle pause
function togglePause() {
    if (!game.isRunning) return;
    
    game.isPaused = !game.isPaused;
    
    if (game.isPaused) {
        showGameStatus("PAUSED");
    } else {
        hideGameStatus();
        gameLoop(); // Resume game loop
    }
    
    // Update pause button text
    const icon = pauseBtn.querySelector('i');
    const text = pauseBtn.querySelector('span');
    if (game.isPaused) {
        icon.className = 'fas fa-play';
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> RESUME';
    } else {
        icon.className = 'fas fa-pause';
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
    }
}

// Toggle sound
function toggleSound() {
    game.soundOn = !game.soundOn;
    
    if (game.soundOn) {
        soundToggle.classList.remove('sound-off');
        soundToggle.classList.add('sound-on');
        soundToggle.innerHTML = '<i class="fas fa-volume-up"></i> SOUND';
    } else {
        soundToggle.classList.remove('sound-on');
        soundToggle.classList.add('sound-off');
        soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i> SOUND';
    }
}

// Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', initGame);
soundToggle.addEventListener('click', toggleSound);

difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setDifficulty(btn.dataset.level);
    });
});

// Initialize the game
window.addEventListener('load', () => {
    initGame();
    setDifficulty('medium');
    draw(); // Draw initial state
});

// Resize canvas to fit container while maintaining aspect ratio
function resizeCanvas() {
    const container = document.querySelector('.game-canvas-container');
    const containerWidth = container.clientWidth;
    
    // Maintain aspect ratio of 800:500 (16:10)
    canvas.width = containerWidth;
    canvas.height = containerWidth * (500 / 800);
    
    // Redraw game
    draw();
}

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Initial resize
setTimeout(resizeCanvas, 100);
