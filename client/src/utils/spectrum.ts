import type {Cell} from "../types/tetrisTypes.ts";
import {GRID_HEIGHT, GRID_WIDTH} from "../Components/TetrisGame.tsx";

export function calculateSpectrum(grid: Cell[][]): number[] {
    const heights: number[] = Array(GRID_WIDTH).fill(0);

    for (let col = 0; col < GRID_WIDTH; col++) {
        for (let row = 0; row < GRID_HEIGHT; row++) {
            if (grid[row][col].value !== 'E' && grid[row][col].locked) {
                // La hauteur est calculée depuis le bas
                heights[col] = GRID_HEIGHT - row;
                break; // On a trouvé le bloc le plus haut de cette colonne
            }
        }
    }
    return heights;
}