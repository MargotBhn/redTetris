import type {Cell, Piece} from "../types/tetrisTypes.ts";
import {GRID_HEIGHT, GRID_WIDTH} from "../Components/TetrisGame.tsx";
import {getCellColor} from "./pieces.ts";

export function createEmptyGrid() {
    return Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(0).map(() => ({
        color: "bg-gray-200",
        value: 'E',
        locked: false,
        blocked: false,
    })));
}


export function getNewGrid(grid: Cell[][], piece: Piece | null): Cell[][] {
    if (!piece)
        return grid

    const newGrid = grid.map(row => row.map(cell => ({...cell})))

    piece.matrix.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell == 1) {
                const newY = y + piece.position.y
                const newX = x + piece.position.x

                newGrid[newY][newX].value = piece.type
                newGrid[newY][newX].color = getCellColor(piece.type)

            }
        })
    })
    return newGrid
}


export function fixPieceIntoGrid(piece: Piece | null, grid: Cell[][]) {
    if (!piece) return grid
    piece.matrix.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell == 1) {
                grid[y + piece.position.y][x + piece.position.x] = {
                    value: piece.type,
                    color: getCellColor(piece.type),
                    locked: true,
                    blocked: false
                }
            }
        })
    })
    return grid
}

