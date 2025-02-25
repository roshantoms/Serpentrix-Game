const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Make canvas responsive
function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.95, 400);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10, direction: 0 }
];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let gameOver = false;

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(evt) {
    const touches = evt.changedTouches;
    touchStartX = touches[0].clientX;
    touchStartY = touches[0].clientY;
}

function handleTouchEnd(evt) {
    if (gameOver) {
        resetGame();
        return;
    }
    
    const touches = evt.changedTouches;
    const deltaX = touches[0].clientX - touchStartX;
    const deltaY = touches[0].clientY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0 && dx !== -1) { dx = 1; dy = 0; }
        else if (deltaX < 0 && dx !== 1) { dx = -1; dy = 0; }
    } else {
        if (deltaY > 0 && dy !== -1) { dx = 0; dy = 1; }
        else if (deltaY < 0 && dy !== 1) { dx = 0; dy = -1; }
    }
}

canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

// Button controls
document.getElementById('upBtn').addEventListener('click', () => {
    if (dy !== 1) { dx = 0; dy = -1; }
});
document.getElementById('downBtn').addEventListener('click', () => {
    if (dy !== -1) { dx = 0; dy = 1; }
});
document.getElementById('leftBtn').addEventListener('click', () => {
    if (dx !== 1) { dx = -1; dy = 0; }
});
document.getElementById('rightBtn').addEventListener('click', () => {
    if (dx !== -1) { dx = 1; dy = 0; }
});

function drawTriangle(x, y, direction, color) {
    const centerX = x * gridSize + gridSize/2;
    const centerY = y * gridSize + gridSize/2;
    const size = gridSize * 0.8;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(direction);
    
    ctx.beginPath();
    ctx.moveTo(0, -size/2);
    ctx.lineTo(-size/2, size/2);
    ctx.lineTo(size/2, size/2);
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

function getDirectionAngle(dx, dy) {
    if (dx === 1) return Math.PI / 2;
    if (dx === -1) return -Math.PI / 2;
    if (dy === 1) return Math.PI;
    if (dy === -1) return 0;
    return 0;
}

document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const SPACE_KEY = 32;
    
    if (event.keyCode === SPACE_KEY && gameOver) {
        resetGame();
        return;
    }
    
    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingLeft = dx === -1;
    const goingRight = dx === 1;
    
    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}

function drawGame() {
    clearCanvas();
    
    if (gameOver) {
        drawGameOver();
        return;
    }
    
    moveSnake();
    checkCollision();
    drawSnake();
    drawFood();
    
    setTimeout(drawGame, 100);
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach(segment => {
        drawTriangle(segment.x, segment.y, segment.direction, 'green');
    });
}

function drawFood() {
    drawTriangle(food.x, food.y, 0, 'red');
}

function moveSnake() {
    const direction = getDirectionAngle(dx, dy);
    const head = { 
        x: snake[0].x + dx, 
        y: snake[0].y + dy,
        direction: direction
    };
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    
    // Prevent food from spawning on snake
    snake.forEach(segment => {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
        }
    });
}

function checkCollision() {
    // Wall collision
    if (snake[0].x < 0 || snake[0].x >= tileCount || 
        snake[0].y < 0 || snake[0].y >= tileCount) {
        gameOver = true;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            gameOver = true;
        }
    }
}

function drawGameOver() {
    ctx.fillStyle = 'black';
    ctx.font = '48px Arial';
    ctx.fillText('Game Over!', canvas.width/4, canvas.height/2);
    ctx.font = '24px Arial';
    ctx.fillText('Tap to Restart', canvas.width/4, canvas.height/2 + 40);
}

function resetGame() {
    snake = [{ x: 10, y: 10, direction: 0 }];
    food = { x: 15, y: 15 };
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    drawGame();
}

drawGame();