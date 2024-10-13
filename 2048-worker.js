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
        grid[row][col] = Math.random() < 0.9 ? 2 : 4; // Spawn 2 or 4
    }
}

function moveRowLeft(row) {
    const newRow = row.filter(value => value !== 0); // Remove zeros
    for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
            newRow[i] *= 2; // Merge tiles
            score += newRow[i]; // Update score
            newRow.splice(i + 1, 1); // Remove merged tile
        }
    }
    return [...newRow, ...Array(4 - newRow.length).fill(0)]; // Fill with zeros
}

function move(direction) {
    let moved = false;

    if (direction === 'left') {
        for (let row = 0; row < 4; row++) {
            const newRow = moveRowLeft(grid[row]); // Move and merge row
            if (grid[row].toString() !== newRow.toString()) {
                moved = true; // Mark if moved
                grid[row] = newRow; // Update grid with new row
            }
        }
    } else if (direction === 'right') {
        for (let row = 0; row < 4; row++) {
            const newRow = moveRowLeft(grid[row].reverse()).reverse(); // Move and merge row
            if (grid[row].toString() !== newRow.toString()) {
                moved = true; // Mark if moved
                grid[row] = newRow; // Update grid with new row
            }
        }
    } else if (direction === 'down') {
        for (let col = 0; col < 4; col++) {
            let newCol = [];
            for (let row = 0; row < 4; row++) {
                newCol.push(grid[row][col]);
            }
            newCol = moveRowLeft(newCol.reverse()).reverse(); // Move and merge column
            for (let row = 0; row < 4; row++) {
                if (grid[row][col] !== newCol[row]) {
                    moved = true; // Mark if moved
                    grid[row][col] = newCol[row]; // Update grid with new column
                }
            }
        }
    } else {
        for (let col = 0; col < 4; col++) {
            let newCol = [];
            for (let row = 0; row < 4; row++) {
                newCol.push(grid[row][col]);
            }
            newCol = moveRowLeft(newCol); // Move and merge column
            for (let row = 0; row < 4; row++) {
                if (grid[row][col] !== newCol[row]) {
                    moved = true; // Mark if moved
                    grid[row][col] = newCol[row]; // Update grid with new column
                }
            }
        }
    }

    if (moved) {
        spawnTile(); // Spawn a new tile after moving
        postUpdate(); // Send updated grid and score
    }
}

onmessage = function(e) {
    const { type, direction } = e.data;
    if (type === 'init') {
        initGame(); // Initialize the game
    } else if (type === 'move') {
        move(direction); // Handle move
    }
};
