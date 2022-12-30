import { CELL_EMPTY, CELL_END, CELL_FILLED, CELL_START } from "../CellState.js";
import { changeCellColor as updateCellColor, updateCellText } from "../HtmlUtil.js";
import { from as _from } from "../main.js";
import Position from "./Pos.js";

export default class BFS {
    /**
     * @param {number[][]} grid
     * @param {Position} startPos
     * @param {Position} endPos
    */
    constructor(grid, startPos, endPos) {
        this.grid = grid;

        this.startPos = startPos;
        this.endPos = endPos;

        this.knownDists = grid.map((row) => {
            return row.map((cell) => {
                if (cell === CELL_START) return { value: -1, from: null };
                if (cell === CELL_EMPTY) return { value: 0, from: null };
                if (cell === CELL_END) return { value: -2, from: null };
                if (cell === CELL_FILLED) return { value: NaN, from: null };
            });
        });

        this.foundSolution = false;
    }

    /**
     * Gets the neighbors from a point p and returns 
     * an array of what their current value is in addition to their
     * indecies
     * 
     * @param {Position} position
     */
    getNeighbors(position) {
        const isValidPos = (pos) => {
            if (pos.row < 0 || pos.row >= this.grid.length) return false;
            if (pos.col < 0 || pos.col >= this.grid[0].length) return false;

            return true;
        };

        let neighbors = [
            { row: position.row - 1, col: position.col },
            { row: position.row + 1, col: position.col },
            { row: position.row, col: position.col - 1 },
            { row: position.row, col: position.col + 1 },
        ];

        neighbors = neighbors.filter(isValidPos);

        return neighbors.map((cell) => {
            return { pos: cell, value: this.knownDists[cell.row][cell.col].value };
        });

    }

    /**
     * Simulate 1 step in the BFS algorithm
     */
    step() {
        let toUpdate = [];

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                const curCell = this.knownDists[i][j].value;
                let curCellValue = curCell;

                if (isNaN(curCell) || curCell == 0) continue;
                if (this.endPos && (i === this.endPos.row && j === this.endPos.col)) continue;

                if (curCell === -1) curCellValue = 0;

                let neighbors = this.getNeighbors({ row: i, col: j });

                /* Loop through the neighbors updating their distance to be 
                the minimum of this cell's dist+1, and its current distance
                except for the case where 
                    1. the neighbor is START_CELL
                    2. the neighbor's value is 0 (just count that as INF)
                */

                neighbors.forEach((cell) => {
                    const { row, col } = cell.pos;
                    const neighborValue = cell.value;

                    if (isNaN(neighborValue)) return;

                    let newFrom = this.knownDists[row][col].from;
                    let newNeighborValue = neighborValue;

                    if (newNeighborValue === CELL_START) { };
                    if (neighborValue === 0) {
                        newFrom = { row: i, col: j };
                        newNeighborValue = curCellValue + 1;
                    } else if (curCellValue + 1 < neighborValue) {
                        newNeighborValue = curCellValue + 1;
                        newFrom = { row: i, col: j };
                    }

                    if (this.endPos)
                        if (row === this.endPos.row && col === this.endPos.col) newFrom = { row: i, col: j };

                    toUpdate.push({ row, col, value: newNeighborValue, from: newFrom });
                });
            }
        }

        toUpdate.forEach((cell) => {
            let { value } = cell;
            if (value == -1 || value == -2) return;

            const colors = [
                'rgb(219, 95, 81)',
                'rgb(227, 118, 64)',
                'rgb(255, 242, 0)',
                'rgb(54, 168, 90)',
                'rgb(15, 160, 209)',
                'rgb(148, 15, 209)'
            ];

            value = value % colors.length;
            updateCellColor(cell.row, cell.col, colors[value]);
        });


        toUpdate.forEach((cellToUpdate) => {
            const { row, col, value, from } = cellToUpdate;

            this.knownDists[row][col] = { value, from };
            updateCellText(row, col, value);


            if (!this.endPos) return;

            if (row === this.endPos.row && col === this.endPos.col && !this.foundSolution) {
                console.log("FOUND SOLUTION!", row, col, _from(row, col));
                let path = [{ row, col }];
                let curCell = { row, col };

                while (curCell = _from(curCell.row, curCell.col)) {
                    path.push(curCell);
                }

                let i = 0;
                for (const cell of path.reverse()) {
                    setTimeout(() => updateCellColor(cell.row, cell.col, "rgb(255, 0, 0)", 0.65), i++ * 100);
                }

                this.foundSolution = true;
            }
        });
    }
}