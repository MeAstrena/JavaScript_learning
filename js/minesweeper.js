let msGrid = [];
let msSize = 10;
let msMines = 15;
let msRevealed = 0;
let msFlags = 0;
let msGameOver = false;
let msFirstClick = true;
let msHighScore = parseInt(localStorage.getItem('minesweeperHighScore')) || 0;
let msTimer = null;
let msSeconds = 0;

function renderMinesweeperPage() {
    const app = document.getElementById('app');

    app.appendChild(createNav([
        { text: "На главную", href: "index.html" },
        { text: "Учебные интересы", href: "science.html" },
        { text: "Мои хобби", href: "hobby.html" }
    ]));

    const wrapper = createEl('div', { className: 'game-wrapper' });
    const consoleEl = createEl('div', { className: 'game-console' });

    const infoBar = createEl('div', { className: 'minesweeper-info' });
    const minesLeftEl = createEl('span', { text: '💣 ' + msMines });
    minesLeftEl.id = 'msMinesLeft';
    const timerEl = createEl('span', { text: '⏱ 0' });
    timerEl.id = 'msTimer';
    const highScoreEl = createEl('span', { text: '🏆 ' + msHighScore });
    highScoreEl.id = 'msHighScore';
    infoBar.appendChild(minesLeftEl);
    infoBar.appendChild(timerEl);
    infoBar.appendChild(highScoreEl);

    const screen = createEl('div', { className: 'game-screen' });
    const gridEl = createEl('div', { className: 'minesweeper-grid' });
    gridEl.id = 'msGrid';
    screen.appendChild(gridEl);

    const startOverlay = createEl('div', { className: 'screen-overlay' });
    startOverlay.id = 'msStartOverlay';
    const startTitle = createEl('h2', { text: 'Сапёр' });
    const startHint = createEl('p', { text: 'Найди все мины, не подорвавшись. Клик — открыть клетку. Правый клик — поставить флажок.' });
    const startBtn = createEl('button', { text: 'Начать игру' });
    startBtn.onclick = () => startMinesweeper();
    startOverlay.appendChild(startTitle);
    startOverlay.appendChild(startHint);
    startOverlay.appendChild(startBtn);
    screen.appendChild(startOverlay);

    const overOverlay = createEl('div', { className: 'screen-overlay game-over hidden' });
    overOverlay.id = 'msOverOverlay';
    const overTitle = createEl('h2', { text: 'Ты проиграл!' });
    overTitle.id = 'msOverTitle';
    const overScore = createEl('p', { text: '' });
    overScore.id = 'msOverScore';
    const overBtn = createEl('button', { text: 'Начать заново' });
    overBtn.onclick = () => startMinesweeper();
    overOverlay.appendChild(overTitle);
    overOverlay.appendChild(overScore);
    overOverlay.appendChild(overBtn);
    screen.appendChild(overOverlay);

    const howToBtn = createEl('button', { className: 'how-to-btn', text: '📖 Как играть' });
    howToBtn.onclick = () => {
        document.getElementById('msHowTo').classList.remove('hidden');
    };

    consoleEl.appendChild(infoBar);
    consoleEl.appendChild(screen);
    consoleEl.appendChild(howToBtn);

    wrapper.appendChild(consoleEl);
    app.appendChild(wrapper);
    app.appendChild(createFooter());
    app.appendChild(createHowToOverlay());
}

function createHowToOverlay() {
    const overlay = createEl('div', { className: 'how-to-overlay hidden' });
    overlay.id = 'msHowTo';

    const content = createEl('div', { className: 'how-to-content' });
    content.appendChild(createEl('h2', { text: 'Как играть в Сапёра' }));

    const rules = [
        'Цель игры — открыть все клетки поля, кроме тех, где спрятаны мины.',
        'Клик по клетке открывает её. Если там мина — игра окончена.',
        'Если под клеткой мины нет, откроется число от 1 до 8 — это количество мин в соседних клетках.',
        'Правый клик мыши ставит красный флажок на предполагаемой мине.',
        'Чтобы победить, нужно открыть все безопасные клетки.',
        'Первая открытая клетка всегда безопасна — мины расставляются после первого клика.'
    ];

    rules.forEach(text => {
        content.appendChild(createEl('p', { text: '• ' + text }));
    });

    const closeBtn = createEl('button', { text: 'Понятно' });
    closeBtn.onclick = () => {
        document.getElementById('msHowTo').classList.add('hidden');
    };
    content.appendChild(closeBtn);

    overlay.appendChild(content);
    return overlay;
}

function buildEmptyGrid() {
    const gridEl = document.getElementById('msGrid');
    gridEl.innerHTML = '';
    gridEl.style.gridTemplateColumns = `repeat(${msSize}, 1fr)`;

    for (let r = 0; r < msSize; r++) {
        for (let c = 0; c < msSize; c++) {
            const cell = createEl('div', { className: 'cell' });
            cell.dataset.row = r;
            cell.dataset.col = c;
            gridEl.appendChild(cell);
        }
    }
}

function attachEvents() {
    const gridEl = document.getElementById('msGrid');
    const cells = gridEl.querySelectorAll('.cell');

    cells.forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);

        let touchTimer = null;
        let longPressFired = false;

        cell.onclick = function() {
            if (longPressFired) {
                longPressFired = false;
                return;
            }
            handleLeftClick(r, c);
        };

        cell.oncontextmenu = function(e) {
            e.preventDefault();
            handleRightClick(r, c);
        };

        cell.addEventListener('touchstart', function(e) {
            longPressFired = false;
            touchTimer = setTimeout(() => {
                longPressFired = true;
                handleRightClick(r, c);
                if (navigator.vibrate) navigator.vibrate(30);
            }, 500);
        }, { passive: true });

        cell.addEventListener('touchend', function(e) {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        });

        cell.addEventListener('touchmove', function(e) {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        });
    });
}

function generateMines(safeRow, safeCol) {
    msGrid = [];
    for (let r = 0; r < msSize; r++) {
        msGrid[r] = [];
        for (let c = 0; c < msSize; c++) {
            msGrid[r][c] = { mine: false, revealed: false, flagged: false, count: 0 };
        }
    }

    let placed = 0;
    while (placed < msMines) {
        const r = Math.floor(Math.random() * msSize);
        const c = Math.floor(Math.random() * msSize);

        if (msGrid[r][c].mine) continue;
        if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;

        msGrid[r][c].mine = true;
        placed++;
    }

    for (let r = 0; r < msSize; r++) {
        for (let c = 0; c < msSize; c++) {
            if (msGrid[r][c].mine) continue;
            let count = 0;
            forNeighbors(r, c, (nr, nc) => {
                if (msGrid[nr][nc].mine) count++;
            });
            msGrid[r][c].count = count;
        }
    }
}

function forNeighbors(r, c, cb) {
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < msSize && nc >= 0 && nc < msSize) {
                cb(nr, nc);
            }
        }
    }
}

function startMinesweeper() {
    document.getElementById('msStartOverlay').classList.add('hidden');
    document.getElementById('msOverOverlay').classList.add('hidden');

    msRevealed = 0;
    msFlags = 0;
    msGameOver = false;
    msFirstClick = true;
    msSeconds = 0;
    msGrid = [];

    document.getElementById('msTimer').textContent = '⏱ 0';
    document.getElementById('msMinesLeft').textContent = '💣 ' + msMines;
    document.getElementById('msHighScore').textContent = '🏆 ' + msHighScore;

    if (msTimer) clearInterval(msTimer);
    msTimer = setInterval(() => {
        msSeconds++;
        document.getElementById('msTimer').textContent = '⏱ ' + msSeconds;
    }, 1000);

    buildEmptyGrid();
    attachEvents();
}

function handleLeftClick(r, c) {
    if (msGameOver) return;

    if (msFirstClick) {
        generateMines(r, c);
        msFirstClick = false;
    }

    const cell = msGrid[r][c];
    if (!cell || cell.revealed || cell.flagged) return;

    if (cell.mine) {
        revealAllMines();
        endMinesweeper(false);
        return;
    }

    revealCell(r, c);
    checkWin();
}

function handleRightClick(r, c) {
    if (msGameOver) return;
    if (msFirstClick) return;

    const cell = msGrid[r][c];
    if (!cell || cell.revealed) return;

    cell.flagged = !cell.flagged;
    msFlags += cell.flagged ? 1 : -1;

    const cellEl = getCellEl(r, c);
    if (cell.flagged) {
        cellEl.classList.add('flag');
        cellEl.textContent = '🚩';
    } else {
        cellEl.classList.remove('flag');
        cellEl.textContent = '';
    }

    document.getElementById('msMinesLeft').textContent = '💣 ' + (msMines - msFlags);
}

function revealCell(r, c) {
    const cell = msGrid[r][c];
    if (!cell || cell.revealed || cell.flagged) return;

    cell.revealed = true;
    msRevealed++;

    const cellEl = getCellEl(r, c);
    cellEl.classList.add('revealed');

    if (cell.count > 0) {
        cellEl.textContent = cell.count;
        cellEl.classList.add('n' + cell.count);
    } else {
        forNeighbors(r, c, (nr, nc) => {
            if (!msGrid[nr][nc].revealed) revealCell(nr, nc);
        });
    }
}

function revealAllMines() {
    for (let r = 0; r < msSize; r++) {
        for (let c = 0; c < msSize; c++) {
            if (msGrid[r][c].mine) {
                const cellEl = getCellEl(r, c);
                cellEl.classList.add('revealed', 'mine');
                cellEl.textContent = '💣';
            }
        }
    }
}

function checkWin() {
    const totalCells = msSize * msSize;
    if (msRevealed === totalCells - msMines) {
        endMinesweeper(true);
    }
}

function endMinesweeper(won) {
    msGameOver = true;
    clearInterval(msTimer);
    msTimer = null;

    if (won) {
        const currentScore = msSeconds;
        if (msHighScore === 0 || currentScore < msHighScore) {
            msHighScore = currentScore;
            localStorage.setItem('minesweeperHighScore', msHighScore);
        }
        document.getElementById('msOverTitle').textContent = 'Ты победил!';
        document.getElementById('msOverScore').textContent = 'Время: ' + currentScore + ' сек. Рекорд: ' + msHighScore + ' сек.';
    } else {
        document.getElementById('msOverTitle').textContent = 'Ты проиграл!';
        document.getElementById('msOverScore').textContent = 'Время: ' + msSeconds + ' сек.';
    }

    document.getElementById('msHighScore').textContent = '🏆 ' + msHighScore;
    document.getElementById('msOverOverlay').classList.remove('hidden');
}

function getCellEl(r, c) {
    const gridEl = document.getElementById('msGrid');
    const index = r * msSize + c;
    return gridEl.children[index];
}