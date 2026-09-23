let canvas, ctx;
let snake = [{x: 10, y: 10}];
let direction = {x: 1, y: 0};
let nextDirection = {x: 1, y: 0};
let food = {x: 15, y: 15};
let score = 0;
let gameLoop = null;
let speed = 150;
let cellsCount = 20;
let isPlaying = false;
let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;

function renderGamePage() {
    const app = document.getElementById('app');

    app.appendChild(createNav([
        { text: "На главную", href: "index.html" },
        { text: "Учебные интересы", href: "science.html" },
        { text: "Мои хобби", href: "hobby.html" }
    ]));

    const wrapper = createEl('div', { className: 'game-wrapper' });
    const consoleEl = createEl('div', { className: 'game-console' });

    const scoreEl = createEl('div', { className: 'game-score', text: 'Счёт: 0' });
    scoreEl.id = 'scoreDisplay';

    const highScoreEl = createEl('div', { className: 'game-score', text: 'Рекорд: ' + highScore });
    highScoreEl.id = 'highScoreDisplay';

    const screen = createEl('div', { className: 'game-screen' });
    canvas = createEl('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 400;
    canvas.height = 400;
    screen.appendChild(canvas);

    const startOverlay = createEl('div', { className: 'screen-overlay' });
    startOverlay.id = 'startOverlay';
    const startTitle = createEl('h2', { text: 'Змейка' });
    const startHint = createEl('p', { text: 'Управление: стрелки или WASD. На телефоне — кнопки внизу.' });
    const startBtn = createEl('button', { text: 'Начать игру' });
    startBtn.onclick = () => startGame();
    startOverlay.appendChild(startTitle);
    startOverlay.appendChild(startHint);
    startOverlay.appendChild(startBtn);
    screen.appendChild(startOverlay);

    const overOverlay = createEl('div', { className: 'screen-overlay game-over hidden' });
    overOverlay.id = 'overOverlay';
    const overTitle = createEl('h2', { text: 'Ты проиграл!' });
    const overScore = createEl('p', { text: 'Счёт: 0' });
    overScore.id = 'overScore';
    const overBtn = createEl('button', { text: 'Начать заново' });
    overBtn.onclick = () => startGame();
    overOverlay.appendChild(overTitle);
    overOverlay.appendChild(overScore);
    overOverlay.appendChild(overBtn);
    screen.appendChild(overOverlay);

    const controls = createEl('div', { className: 'game-controls' });

    const leftBlock = createEl('div', { className: 'control-left' });
    const btnUp = createEl('button', { className: 'btn-arrow', html: '&#9650;' });
    const btnDown = createEl('button', { className: 'btn-arrow', html: '&#9660;' });
    btnUp.onclick = () => changeDirection(0, -1);
    btnDown.onclick = () => changeDirection(0, 1);
    leftBlock.appendChild(btnUp);
    leftBlock.appendChild(btnDown);

    const rightBlock = createEl('div', { className: 'control-right' });
    const btnLeft = createEl('button', { className: 'btn-arrow red', html: '&#9664;' });
    const btnRight = createEl('button', { className: 'btn-arrow red', html: '&#9654;' });
    btnLeft.onclick = () => changeDirection(-1, 0);
    btnRight.onclick = () => changeDirection(1, 0);
    rightBlock.appendChild(btnLeft);
    rightBlock.appendChild(btnRight);

    controls.appendChild(leftBlock);
    controls.appendChild(rightBlock);

    consoleEl.appendChild(scoreEl);
    consoleEl.appendChild(highScoreEl);
    consoleEl.appendChild(screen);
    consoleEl.appendChild(controls);

    wrapper.appendChild(consoleEl);
    app.appendChild(wrapper);
    app.appendChild(createFooter());

    ctx = canvas.getContext('2d');
    draw();
}

function changeDirection(x, y) {
    if (!isPlaying) return;
    if (direction.x === -x && direction.y === -y) return;
    if (direction.x === x && direction.y === y) return;
    nextDirection = {x: x, y: y};
}

function startGame() {
    document.getElementById('startOverlay').classList.add('hidden');
    document.getElementById('overOverlay').classList.add('hidden');

    snake = [{x: 10, y: 10}];
    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};
    score = 0;
    isPlaying = true;
    updateScore();
    placeFood();
    draw();

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, speed);
}

function updateScore() {
    document.getElementById('scoreDisplay').textContent = 'Счёт: ' + score;
    document.getElementById('highScoreDisplay').textContent = 'Рекорд: ' + highScore;
}

function placeFood() {
    let newFood;
    let valid = false;
    while (!valid) {
        newFood = {
            x: Math.floor(Math.random() * cellsCount),
            y: Math.floor(Math.random() * cellsCount)
        };
        valid = !snake.some(s => s.x === newFood.x && s.y === newFood.y);
    }
    food = newFood;
}

function update() {
    if (!isPlaying) return;

    direction = nextDirection;
    
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    if (head.x < 0 || head.x >= cellsCount || head.y < 0 || head.y >= cellsCount) {
        gameOver();
        return;
    }

    if (snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        placeFood();
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    const cellSize = canvas.width / cellsCount;

    ctx.fillStyle = '#e8d9a8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#2ecc71';
    snake.forEach(segment => {
        ctx.fillRect(
            segment.x * cellSize + 1,
            segment.y * cellSize + 1,
            cellSize - 2,
            cellSize - 2
        );
    });

    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
        food.x * cellSize + 1,
        food.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
    );
}

function gameOver() {
    isPlaying = false;
    clearInterval(gameLoop);
    gameLoop = null;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        updateScore();
    }

    document.getElementById('overScore').textContent = 'Счёт: ' + score;
    document.getElementById('overOverlay').classList.remove('hidden');
}

document.addEventListener('keydown', function(e) {
    const key = e.key.toLowerCase();
    
    if (key === 'arrowup' || key === 'w' || key === 'ц') {
        e.preventDefault();
        changeDirection(0, -1);
    }
    if (key === 'arrowdown' || key === 's' || key === 'ы') {
        e.preventDefault();
        changeDirection(0, 1);
    }
    if (key === 'arrowleft' || key === 'a' || key === 'ф') {
        e.preventDefault();
        changeDirection(-1, 0);
    }
    if (key === 'arrowright' || key === 'd' || key === 'в') {
        e.preventDefault();
        changeDirection(1, 0);
    }
});