let grid = [];
let score = 0;

function initGame() {
    grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    score = 0;
    spawnTile();
    spawnTile();
    postUpdate();
}

function postUpdate() {
    postMessage({ type: 'update', grid: grid, score: score });
}

function spawnTile() {
    let emptyTiles = [];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col] === 0) {
                emptyTiles.push({ row, col });
            }
        }
    }
    if (emptyTiles.length > 0) {
        const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        grid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
}

function moveRowLeft(row) {
    row = row.filter(val => val);
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) {
            row[i] *= 2;
            score += row[i];
            row.splice(i + 1, 1);
        }
    }
    return [...row, ...Array(4 - row.length).fill(0)];
}

function move(direction) {
    let moved = false;
    if (direction === 'left' || direction === 'right') {
        for (let row = 0; row < 4; row++) {
            let newRow = direction === 'left' ? moveRowLeft(grid[row]) : moveRowLeft(grid[row].reverse()).reverse();
            if (grid[row].toString() !== newRow.toString()) {
                grid[row] = newRow;
                moved = true;
            }
        }
    } else if (direction === 'up' || direction === 'down') {
        for (let col = 0; col < 4; col++) {
            let column = grid.map(row => row[col]);
            let newColumn = direction === 'up' ? moveRowLeft(column) : moveRowLeft(column.reverse()).reverse();
            if (column.toString() !== newColumn.toString()) {
                for (let row = 0; row < 4; row++) {
                    grid[row][col] = newColumn[row];
                }
                moved = true;
            }
        }
    }

    if (moved) {
        spawnTile();
        postUpdate();
        if (checkGameOver()) {
            postMessage({ type: 'gameOver' });
        }
    }
}

function checkGameOver() {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col] === 0) return false;
            if (col < 3 && grid[row][col] === grid[row][col + 1]) return false;
            if (row < 3 && grid[row][col] === grid[row + 1][col]) return false;
        }
    }
    return true;
}

onmessage = function(e) {
    const { type, direction } = e.data;
    if (type === 'init') {
        initGame();
    } else if (type === 'move') {
        move(direction);
    }
};
