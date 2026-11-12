//Так чисто для оформления
const siteData = {
    author: "Дусаева Кристина Родионовна",
    contacts: {
        email: "youloveda@mail.ru",
        phones: ["8-978-598-60-81", "8-961-276-40-23"]
    },
    socials: [
        { name: "Telegram", url: "@asterkris" },
        { name: "VK", url: "https://vk.ru/tea_chocolade" },
        { name: "GitHub", url: "https://github.com/MeAstrena" }
    ]
};

function createEl(tag, options = {}) {
    const el = document.createElement(tag);
    if (options.className) el.className = options.className;
    if (options.text) el.textContent = options.text;
    if (options.html) el.innerHTML = options.html;
    if (options.src) el.src = options.src;
    if (options.alt) el.alt = options.alt;
    if (options.href) el.href = options.href;
    if (options.onclick) el.onclick = options.onclick;
    return el;
}

function createNav(navItems) {
    const nav = createEl('div', { className: 'floating-nav' });
    navItems.forEach(item => {
        const btn = createEl('div', { className: 'button' });
        const link = createEl('a', { href: item.href, text: item.text });
        btn.appendChild(link);
        nav.appendChild(btn);
    });
    return nav;
}

function createFooter() {
    const footer = createEl('div', { className: 'footer' });
    const content = createEl('div', { className: 'footer-content' });

    content.appendChild(createEl('p', { text: `© 2026 ${siteData.author}` }));

    const socialsDiv = createEl('div', { className: 'social-links' });
    socialsDiv.appendChild(createEl('span', { text: 'Соцсети:' }));
    siteData.socials.forEach((s, i) => {
        const link = createEl('a', { href: s.url, className: 'social-link', text: s.name });
        socialsDiv.appendChild(link);
        if (i < siteData.socials.length - 1) {
            socialsDiv.appendChild(document.createTextNode(' | '));
        }
    });
    content.appendChild(socialsDiv);

    const btnBlock = createEl('div', { className: 'footer-btn' });
    const snakeBtn = createEl('a', { href: 'snake.html', text: 'Играть в Змейку' });
    btnBlock.appendChild(snakeBtn);
    const minesweeperBtn = createEl('a', { href: 'minesweeper.html', text: 'Играть в Сапёра' });
    btnBlock.appendChild(minesweeperBtn);
    content.appendChild(btnBlock);

    const note = createEl('p', {
        className: 'footer-note',
        text: `Email: ${siteData.contacts.email} | Телефоны: ${siteData.contacts.phones.join(', ')}`
    });
    content.appendChild(note);

    footer.appendChild(content);
    return footer;
}



// Сама игра
let board = [];
let totalMines = 10;
let isGameOver = false;
let isFirstClick = true;

function createCells() {
    return {
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
    };
}

function Game() {
    board = [];
    isGameOver = false;
    isFirstClick = true;

    const app = document.getElementById('app');
    app.innerHTML = '';

    app.appendChild(createNav([
        { text: "На главную", href: "index.html" },
        { text: "Учебные интересы", href: "science.html" },
        { text: "Мои хобби", href: "hobby.html" }
    ]));

    const wrapper = createEl('div', { className: 'game-wrapper' });
    const consoleEl = createEl('div', { className: 'game-console' });

    const infoBar = createEl('div', { className: 'minesweeper-info' });
    const minesLeftEl = createEl('span', { text: '💣 ' + totalMines });
    minesLeftEl.id = 'mines-left';
    infoBar.appendChild(minesLeftEl);

    const screen = createEl('div', { className: 'game-screen' });

    const boardElement = createEl('div', { className: 'board' });
    boardElement.id = 'board';

    for (let i = 0; i < 10; i++) {
        let rowData = [];
        const row = createEl('div', { className: 'row' });
        for (let j = 0; j < 10; j++) {
            rowData.push(createCells());
            const cell = createEl('div', { className: 'cell' });
            cell.dataset.x = j;
            cell.dataset.y = i;
            row.appendChild(cell);
        }
        board.push(rowData);
        boardElement.appendChild(row);
    }
    screen.appendChild(boardElement);

    const startOverlay = createEl('div', { className: 'screen-overlay' });
    startOverlay.id = 'start-overlay';
    startOverlay.innerHTML = `
        <h2>Сапёр</h2>
        <p>Найди все мины, не подорвавшись. Клик — открыть, правый клик — флажок.</p>
        <button id="start-btn">Начать игру</button>
    `;
    screen.appendChild(startOverlay);

    const overOverlay = createEl('div', { className: 'screen-overlay game-over hidden' });
    overOverlay.id = 'over-overlay';
    overOverlay.innerHTML = `
        <h2 id="over-title">Ты проиграл!</h2>
        <button id="restart-btn">Начать заново</button>
    `;
    screen.appendChild(overOverlay);

    const howToBtn = createEl('button', { className: 'how-to-btn', text: '📖 Как играть' });
    howToBtn.onclick = () => document.getElementById('rules-overlay').classList.remove('hidden');

    consoleEl.appendChild(infoBar);
    consoleEl.appendChild(screen);
    consoleEl.appendChild(howToBtn);
    wrapper.appendChild(consoleEl);
    app.appendChild(wrapper);
    
    app.appendChild(createFooter());
    app.appendChild(createHowToOverlay());

    document.getElementById('start-btn').onclick = () => {
        startOverlay.classList.add('hidden');
    };

    document.getElementById('restart-btn').onclick = () => {
        Game();
    };

    function updateMinesLeft() {
        let flags = 0;
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (board[i][j].isFlagged) flags++;
            }
        }
        minesLeftEl.textContent = '💣 ' + (totalMines - flags);
    }

    boardElement.addEventListener('click', function (event) {
        const clickedCell = event.target;
        if (!clickedCell.classList.contains('cell')) return;
        const x = parseInt(clickedCell.dataset.x);
        const y = parseInt(clickedCell.dataset.y);
        rClicks(x, y, clickedCell);
    });

    boardElement.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        const clickedCell = event.target;
        if (!clickedCell.classList.contains('cell')) return;
        const x = parseInt(clickedCell.dataset.x);
        const y = parseInt(clickedCell.dataset.y);
        toggleFlag(x, y, clickedCell);
    });

    function placeMines(FX, FY) {
        let countMines = 0;
        while (countMines < totalMines) {
            let x = Math.floor(Math.random() * 10);
            let y = Math.floor(Math.random() * 10);
            if (Math.abs(x - FX) <= 1 && Math.abs(y - FY) <= 1) continue;
            if (!board[y][x].isMine) {
                board[y][x].isMine = true;
                countMines++;
            }
        }
    }

    function countNeighbors() {
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                if (board[y][x].isMine) {
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (i === 0 && j === 0) continue;
                            if (x + i >= 0 && x + i < 10 && y + j >= 0 && y + j < 10) {
                                board[y + j][x + i].neighborMines++;
                            }
                        }
                    }
                }
            }
        }
    }

    function rClicks(x, y, clickedCell) {
        if (isFirstClick) {
            placeMines(x, y);
            countNeighbors();
            isFirstClick = false;
        }
        const cellData = board[y][x];
        if (isGameOver) return;
        if (cellData.isRevealed || cellData.isFlagged) return;
        
        if (cellData.isMine) { 
            isGameOver = true;
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    if (board[i][j].isMine) {
                        const mineCell = document.querySelector(`.cell[data-x='${j}'][data-y='${i}']`);
                        mineCell.textContent = "💣";
                        mineCell.style.backgroundColor = "#ff4d4d";
                    }
                }
            }
            document.getElementById('over-title').textContent = 'Ты проиграл!';
            overOverlay.classList.remove('hidden');
            return;
        }
        
        cellData.isRevealed = true;
        clickedCell.style.backgroundColor = "#e0e0e0";
        
        if (cellData.neighborMines > 0) {
            clickedCell.textContent = cellData.neighborMines;
        }
        
        if (cellData.neighborMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    let Nx = x + i;
                    let Ny = y + j;
                    if (Nx >= 0 && Nx < 10 && Ny >= 0 && Ny < 10) {
                        const neighborData = board[Ny][Nx];
                        if (!neighborData.isRevealed && !neighborData.isFlagged) {
                            const neighborCell = document.querySelector(`.cell[data-x='${Nx}'][data-y='${Ny}']`);
                            rClicks(Nx, Ny, neighborCell);
                        }
                    }
                }
            }
        }
        checkWin();
    }

    function toggleFlag(x, y, clickedCell) {
        if (isGameOver) return;
        const cellData = board[y][x];
        if (cellData.isRevealed) return;
        cellData.isFlagged = !cellData.isFlagged;
        if (cellData.isFlagged) {
            clickedCell.textContent = "🚩";
        } else {
            clickedCell.textContent = "";
        }
        updateMinesLeft();
    }

    function checkWin() {
        let revealedCount = 0;
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (board[i][j].isRevealed) {
                    revealedCount++;
                }
            }
        }
        if (revealedCount === 100 - totalMines) {
            isGameOver = true;
            document.getElementById('over-title').textContent = 'Ты победил!';
            document.getElementById('over-title').style.color = '#2ecc71';
            overOverlay.classList.remove('hidden');
        }
    }
}

function createHowToOverlay() {
    const overlay = createEl('div', { className: 'how-to-overlay hidden' });
    overlay.id = 'rules-overlay';

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
        document.getElementById('rules-overlay').classList.add('hidden');
    };
    content.appendChild(closeBtn);

    overlay.appendChild(content);
    return overlay;
}

Game();