import type {Cell, Piece} from "../types/tetrisTypes.ts";
import {copyPiece} from "./pieces.ts";
import {GRID_HEIGHT, GRID_WIDTH} from "../Components/TetrisGame.tsx";

export function testMovementPossible(grid: Cell[][], piece: Piece) {
    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x] == 1) {
                const newY = y + piece.position.y
                const newX = x + piece.position.x
                if (newY > GRID_HEIGHT - 1 || newY < 0 || newX > GRID_WIDTH - 1 || newX < 0) {
                    return false
                }
                if (grid[newY][newX].value !== 'E')
                    return false
            }
        }
    }
    return true
}

export function forcePieceDown(grid: Cell[][], piece: Piece): Piece {
    const newPiece = copyPiece(piece);

    // On descend la pièce ligne par ligne jusqu'à ce qu'elle ne puisse plus descendre
    while (true) {
        newPiece.position.y += 1;
        if (!testMovementPossible(grid, newPiece)) {
            // On ne peut plus descendre, on remonte d'une ligne
            newPiece.position.y -= 1;
            break;
        }
    }
    return newPiece;
}

export function gameIsLost(grid: Cell[][], piece: Piece | null) {
    if (!piece)
        return false

    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece?.matrix[y][x] == 1) {
                if (grid[y + piece.position.y][x + piece.position.x].value !== 'E') {
                    return true
                }
            }
        }
    }
    return false
}
