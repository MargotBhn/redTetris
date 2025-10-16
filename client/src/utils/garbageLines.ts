import type {Cell, Piece} from "../types/tetrisTypes.ts";
import {GRID_WIDTH} from "../Components/TetrisGame.tsx";
import {getCellColor} from "./pieces.ts";

export function addGarbageLine(grid: Cell[][], activePiece: Piece | null, numberLines: number): {
    newGrid: Cell[][],
    newPiece: Piece | null,
    playerLost: boolean,
} {
    let playerLost = false;

    // Check if there's no piece on the top lines that will be removed. If so, set GameLost
    for (let y = 0; y < numberLines; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (grid[y][x].value !== 'E')
                playerLost = true
        }
    }

    // Copie de la grille
    const newGrid = grid.slice(numberLines); // supprime les lignes


    // Création des lignes bloquées
    for (let i = 0; i < numberLines; i++) {
        const blockedRow = Array(GRID_WIDTH).fill(0).map(() => ({
            value: 'B',
            color: getCellColor('B'),
            locked: true,
            blocked: true,
        }));
        newGrid.push(blockedRow);
    }


    // On remonte la pièce active
    const newPiece = activePiece ? {
        ...activePiece,
        position: {...activePiece.position, y: Math.max(0, activePiece.position.y - numberLines)}
    } : null;
    if (newPiece?.position.y && newPiece?.position.y < 0) {
        playerLost = true;
    }
    return {newGrid, newPiece, playerLost};
}