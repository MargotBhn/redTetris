import type {Cell} from "../types/tetrisTypes.ts";
import {GRID_HEIGHT, GRID_WIDTH} from "../Components/TetrisGame.tsx";
import {socketMiddleware} from "../middleware/socketMiddleware.ts";

export function clearCompleteLines(grid: Cell[][], room: string | undefined) {
    let linesCleared = 0;
    const newGrid = grid.filter((row) => {
        const isComplete = row.every(cell => cell.value !== 'E');
        const hasBlockedCell = row.some(cell => cell.blocked || cell.value === 'B');
        if (isComplete && !hasBlockedCell) {
            linesCleared++;
            return false; // on supprime cette ligne
        }
        return true; // sinon on la garde
    });

    // On complète la grille pour garder la même hauteur
    while (newGrid.length < GRID_HEIGHT) {
        newGrid.unshift(
            Array(GRID_WIDTH).fill(0).map(() => ({
                color: "bg-gray-200",
                value: 'E',
                locked: false,
                blocked: false,
            }))
        );
    }
    if (linesCleared > 1 && room) {
        socketMiddleware.sendGarbageLines(linesCleared - 1, room);
    }
    return {newGrid, linesCleared};
}