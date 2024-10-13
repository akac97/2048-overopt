let grid = [];
let score = 0;

function initGame() {
    grid = Array.from({ length: 4 }, () => Array(4).fill(0)); // Initialize a 4x4 grid
    score = 0; // Reset score
    spawnTile(); // Spawn initial tiles
    spawnTile();
    postUpdate(); // Send initial grid and score to the main thread
}

function postUpdate() {
    postMessage({ type: 'update', grid: grid, score: score }); // Update the main thread
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
        grid[row][col] = Math.random() < 0.9 ? 2 : 4; // Spawn either a 2 or 4
    }
}

function moveRowLeft(row) {
    row = row.filter(val => val); // Remove all zeroes
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] === row[i + 1]) { // Merge tiles
            row[i] *= 2;
            score += row[i];
            row.splice(i + 1, 1);
        }
    }
    return [...row, ...Array(4 - row.length).fill(0)]; // Fill with zeroes
}

function move(direction) {
    let moved = false;
    if (direction === 'left' || direction === 'right') {
        for (let row = 0; row < 4; row++) {
            const newRow = direction === 'left' ? moveRowLeft(grid[row]) : moveRowLeft(grid[row].slice().reverse()).reverse();
            if (newRow.toString() !== grid[row].toString()) {
                moved = true;
                grid[row] = newRow; // Update grid with new row
            }
        }
    } else {
        for (let col = 0; col < 4; col++) {
            let newCol = [];
            for (let row = 0; row < 4; row++) {
                newCol.push(grid[row][col]);
            }
            newCol = direction === 'up' ? moveRowLeft(newCol) : moveRowLeft(newCol.reverse()).reverse();
            for (let row = 0; row < 4; row++) {
                if (grid[row][col] !== newCol[row]) {
                    moved = true;
                    grid[row][col] = newCol[row]; // Update grid with new column
                }
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
