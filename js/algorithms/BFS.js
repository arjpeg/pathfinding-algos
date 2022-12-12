import { CELL_EMPTY, CELL_END, CELL_FILLED, CELL_START } from "../CellState.js";
import { updateCellText } from "../HtmlUtil.js";
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
    }

    /**
     * Gets the neighbors from a point p and returns 
     * an array of what their current value is in addition to their
     * indecies
     * 
     * @param {Position} position
     */
    getNeighbors(position) {
        let neighbors = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newPos = { row: position.row + i, col: position.col + j };

                if (i === 0 && j === 0) continue;
                if (newPos.row < 0 || newPos.row >= this.grid.length) continue;
                if (newPos.col < 0 || newPos.col >= this.grid[0].length) continue;

                neighbors.push({
                    pos: newPos,
                    value: this.knownDists[newPos.row][newPos.col].value
                });
            }
        }

        return neighbors;
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

                if (isNaN(curCell) || curCell == 0 || (i === this.endPos.row && j === this.endPos.col)) continue;
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

                    if (row === this.endPos.row && col === this.endPos.col) newFrom = { row: i, col: j };

                    toUpdate.push({ row, col, value: newNeighborValue, from: newFrom });
                });
            }
        }

        toUpdate.forEach((cellToUpdate) => {
            const { row, col, value, from } = cellToUpdate;

            this.knownDists[row][col] = { value, from };

            // console.log(from);

            if (row === this.endPos.row && col === this.endPos.col) {
                console.log("FOUND SOLUTION!", row, col);
                // this.printPath({ row, col });
                console.log(from);
                let curPathStr = "";
                let curCell = { row, col, from: cellToUpdate.from };

                while (curCell.from) {
                    curPathStr += `-> (${row}, ${col})`;
                    curCell = curCell.from;
                }

                console.log(curPathStr);
            }

            updateCellText(row, col, value);
        });
    }
}