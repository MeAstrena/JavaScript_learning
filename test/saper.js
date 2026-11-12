let board = [];
let totalMines = 10;
let isGameOver = false;
let isFirstClick = true;

function createCells() {
    let cell = {
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
    }
    return cell;
}

function Game() {
    console.log("Game started");
    const boardElement = document.createElement('div');
    boardElement.className = 'board';
    let button = document.createElement('button');
    button.textContent = "Restart";
    button.className = "hidden";
    document.body.appendChild(button);

    for (let i = 0; i < 10; i++) {
        let rowData = [];
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < 10; j++) {
            rowData.push(createCells());
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = j;
            cell.dataset.y = i;
            row.appendChild(cell);
        }
        board.push(rowData);
        boardElement.appendChild(row);
    }
    document.body.appendChild(boardElement);


    boardElement.addEventListener('click', function (event) {
        const clickedCell = event.target;
        if (!clickedCell.classList.contains('cell')) return;
        const x = parseInt(clickedCell.dataset.x);
        const y = parseInt(clickedCell.dataset.y);
        console.log(x, y);
        rClicks(x, y, clickedCell);
        }
    )

    boardElement.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        const clickedCell = event.target;
        if (!clickedCell.classList.contains('cell')) return;
        const x = parseInt(clickedCell.dataset.x);
        const y = parseInt(clickedCell.dataset.y);
        console.log(x, y);
        toggleFlag(x, y, clickedCell);
        }
    )


    function placeMines(FX, FY) {
        let countMines = 0;
        while (countMines < totalMines) {
            let x = Math.floor(Math.random() * 10);
            let y = Math.floor(Math.random() * 10);
            if (Math.abs(x - FX) <= 1 && Math.abs(y - FY) <= 1) continue;
            if (!board[y][x].isMine) {
                board[y][x].isMine = true;
                countMines++;
            } else { continue; }
        }
    }

    function countNeighbors() {
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                if (board[y][x].isMine) {
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (i === 0 && j === 0) continue;
                            else if (x + i >= 0 && x + i < 10 && y + j >= 0 && y + j < 10) {
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
            alert("You Lose!");
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    if (board[i][j].isMine) {
                        const mineCell = document.querySelector(`.cell[data-x='${j}'][data-y='${i}']`);
                        mineCell.textContent = "💣";
                        button.classList.add("game-over");
                        button.classList.remove("hidden");
                        button.addEventListener("click", function () {
                            location.reload();
                            button.classList.remove("game-over");
                            button.classList.add("hidden");
                        });
                    }
                }
            }
        }
        else {
            cellData.isRevealed = true;
            clickedCell.style.backgroundColor = "#00ff26";
        }
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
        const cellData = board[y][x];
        if (cellData.isRevealed) return;
        cellData.isFlagged = !cellData.isFlagged;
        if (!cellData.isFlagged) {
            clickedCell.textContent = "";
        } else {
            clickedCell.textContent = "🚩";
        }
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
            alert("You Win!");
        }
    }
}

Game();