import BFS from "./algorithms/BFS.js";

import { CELL_EMPTY, CELL_END, CELL_FILLED, CELL_START } from "./CellState.js";
import { addHTMLRow, clearHTMLGrid, createHTMLRow, updateUICell } from "./HtmlUtil.js";
import { END_CELL, PATH_CELL, START_CELL } from "./PathType.js";

let cellTypeSelected = PATH_CELL;
let grid;

let startCell, endCell;
let mouseHeld = false;
let prevCellHovered;

let currentAlgorithm;
let stepTimeoutID;

const FRAME_RATE_MS = 1000;

const playOptionBtns = {
    play: document.querySelector('#play'),
    pause: document.querySelector('#pause'),
    clear: document.querySelector('#clear')
};

/**
 * 
 * @param {number} row
 * @param {number} col
 */
export function handleCellClickEvent(row, col) {
    const curCellState = grid[row][col];
    let newCellType;

    if (cellTypeSelected === PATH_CELL) {
        if (curCellState === CELL_EMPTY) newCellType = CELL_FILLED;
        if (curCellState === CELL_FILLED) newCellType = CELL_EMPTY;
    } if (cellTypeSelected === START_CELL) {
        if (startCell) {
            updateUICell(startCell.row, startCell.col, CELL_EMPTY);
            grid[startCell.row][startCell.col] = CELL_EMPTY;
        }

        newCellType = CELL_START;
        startCell = { row: row, col: col };
    } if (cellTypeSelected === END_CELL) {
        if (endCell) {
            updateUICell(endCell.row, endCell.col, CELL_EMPTY);
            grid[endCell.row][endCell.col] = CELL_EMPTY;
        }

        newCellType = CELL_END;
        endCell = { row: row, col: col };
    }


    grid[row][col] = newCellType;
    updateUICell(row, col, newCellType);
}


/**
 * Create a new grid based off of gridSize
 * @param {number} gridSize
 * @returns {number[][]}
 */
export function newGrid(gridSize = 10) {
    clearHTMLGrid();
    currentAlgorithm = null;

    let g = [];

    for (let i = 0; i < gridSize; i++) {
        let row = [];

        for (let j = 0; j < gridSize; j++) {
            row.push(CELL_EMPTY);
        }

        g.push(row);

        let rowElem = createHTMLRow(row, i);
        addHTMLRow(rowElem);

        if (rowElem.childNodes.length < row.length) row.splice(0, rowElem.childNodes.length);
        if (rowElem.getBoundingClientRect().top > window.innerHeight + 200) break;

    }

    grid = g;

    return g;
}

export function changeCurrentCellType(newType, displayText) {
    if (newType === 'start') cellTypeSelected = START_CELL;
    if (newType === 'path') cellTypeSelected = PATH_CELL;
    if (newType === 'end') cellTypeSelected = END_CELL;

    document.getElementById("current-cell-type").innerText = displayText;
}

export function from(r, c) {
    if (Number.isInteger(r))
        return currentAlgorithm.knownDists[r][c].from;
    else
        return currentAlgorithm.knownDists[r.row][r.col].from;
};

playOptionBtns.play.addEventListener('click', (e) => {
    currentAlgorithm = new BFS(grid, startCell, endCell);
    currentAlgorithm.step();
    // stepTimeoutID = setInterval(currentAlgorithm.step, FRAME_RATE_MS);
});

playOptionBtns.clear.addEventListener('click', (e) => {
    grid = newGrid(document.querySelector('#gridSize').value);
    currentAlgorithm = null;
});


window.addEventListener("pointerdown", (e) => {
    if (!e.target.classList.contains('cell')) return;

    const parent = e.target.parentElement;

    const row = [...parent.parentElement.children].indexOf(parent);
    const col = [...parent.children].indexOf(e.target);

    prevCellHovered = { row, col };

    handleCellClickEvent(row, col);
    mouseHeld = true;
});

window.addEventListener('pointermove', (e) => {
    if (!mouseHeld) return;
    if (!e.target.classList.contains('cell')) return;

    const parent = e.target.parentElement;

    const row = [...parent.parentElement.children].indexOf(parent);
    const col = [...parent.children].indexOf(e.target);

    if (prevCellHovered.row != row || prevCellHovered.col != col)
        handleCellClickEvent(row, col);

    prevCellHovered = { row, col };

});

window.addEventListener("pointerup", (_) => mouseHeld = false);

window.addEventListener("keypress", (e) => {
    if (e.key === "s") changeCurrentCellType('start', 'Start Cell');
    if (e.key === "p") changeCurrentCellType('path', 'Path Cell');
    if (e.key === "e") changeCurrentCellType('end', 'End Cell');
    if (e.key === " ") {
        if (currentAlgorithm) currentAlgorithm.step();
        else {
            currentAlgorithm = new BFS(grid, startCell, endCell);
            currentAlgorithm.step();
        }
    }
});

window.changeCurrentCellType = changeCurrentCellType;
window.newGrid = newGrid;
window.step = () => {
    if (currentAlgorithm && !currentAlgorithm.foundSolution) currentAlgorithm.step();
    else {
        currentAlgorithm = new BFS(grid, startCell, endCell);
        currentAlgorithm.step();
    }
};

window.grid = grid;
window.curAlgo = () => currentAlgorithm;
window.from = from;
window.grid = () => grid;

newGrid();