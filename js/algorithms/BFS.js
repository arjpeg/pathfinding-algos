import { CELL_EMPTY, CELL_END, CELL_FILLED, CELL_START } from "../CellState.js";
import { changeCellColor as updateCellColor } from "../HtmlUtil.js";
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
        this.frontier = [startPos];
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

        for (const cellInFrontier of this.frontier) {
            const curCell = this.knownDists[cellInFrontier.row][cellInFrontier.col].value;
            let curCellValue = curCell != -1 ? curCell : 0;

            if (isNaN(curCell) || curCell == 0) continue;

            let neighbors = this.getNeighbors(cellInFrontier);
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
                    newFrom = cellInFrontier;
                    newNeighborValue = curCellValue + 1;
                } else if (curCellValue + 1 < neighborValue) {
                    newNeighborValue = curCellValue + 1;
                    newFrom = cellInFrontier;
                }

                if (this.endPos)
                    if (row === this.endPos.row && col === this.endPos.col) newFrom = cellInFrontier;

                toUpdate.push({ row, col, value: newNeighborValue, from: newFrom });
            });
        }

        toUpdate.forEach((cell) => {
            let { value } = cell;
            if (value == -1 || value == -2) return;

            const colors = [
                'rgb(8, 82, 199)',
                'rgb(66, 135, 245)',
                'rgb(77, 135, 227)',
                'rgb(108, 155, 230)'
            ];

            value = value % colors.length;
            updateCellColor(cell.row, cell.col, colors[value], 0.2);
        });


        toUpdate.forEach((cellToUpdate) => {
            const { row, col, value, from } = cellToUpdate;

            this.knownDists[row][col] = { value, from };

            if (!this.endPos) return;

            if (row === this.endPos.row && col === this.endPos.col && !this.foundSolution) {
                console.log("FOUND SOLUTION!", row, col, _from(row, col));
                this.foundSolution = true;

                let path = [{ row, col }];
                let curCell = { row, col };

                while (curCell = _from(curCell.row, curCell.col)) {
                    path.push(curCell);
                }

                let i = 0;
                for (const cell of path.reverse()) {
                    setTimeout(() => updateCellColor(cell.row, cell.col, "rgb(253, 0, 0)", 0.55), i++ * 100);
                }
            }
        });

        // keeps track of the unique positions that we change
        let seen = [];

        toUpdate.forEach((cell) => {
            for (let _cell of seen) {
                if (_cell.row == cell.row && _cell.col == cell.col) return;
            }

            seen.push(cell);
        });

        this.frontier = seen;
    }
}