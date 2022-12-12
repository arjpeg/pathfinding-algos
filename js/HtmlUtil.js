import { CELL_EMPTY, CELL_END, CELL_FILLED, CELL_START } from './CellState.js';

const gridElem = document.getElementById('mainGrid');

/**
 * Clears the html grid.
 */
export function clearHTMLGrid() {
    gridElem.innerHTML = "";
}

/**
 * 
 * @param {HTMLElement} row 
 */
export function addHTMLRow(row) {
    gridElem.appendChild(row);
}

/**
 * 
 * @param {number[]} row
 * @param {number} rowIdx
 */
export function createHTMLRow(row, rowIdx) {
    let rowElem = document.createElement("div");
    rowElem.classList.add("gridRow");

    for (let i = 0; i < row.length; i++) {
        let cellElem = document.createElement("div");
        cellElem.classList.add("cell");
        rowElem.appendChild(cellElem);

        if (cellElem.getBoundingClientRect().right > window.innerWidth) break;
    }

    return rowElem;
}

/**
* 
* @param {number} row
* @param {number} col
* @param {number} value
*/
export function updateUICell(row, col, value) {
    const cell = gridElem.childNodes.item(row).childNodes.item(col);

    if (value === CELL_EMPTY)
        cell.dataset.cell = 'empty';
    if (value === CELL_FILLED)
        cell.dataset.cell = 'filled';
    if (value === CELL_START)
        cell.dataset.cell = 'start';
    if (value === CELL_END)
        cell.dataset.cell = 'end';
}

/**
* 
* @param {number} row
* @param {number} col
* @param {string} text
*/
export function updateCellText(row, col, text) {
    const cell = gridElem.children.item(row).children.item(col);

    cell.innerHTML = text;
}