export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface PiecePosition {
    x: number,
    y: number
}

export interface Piece {
    type: PieceType,
    position: PiecePosition
    rotation: number,
    matrix: number[][],
    color: string
}

export interface Cell {
    value: string;
    color: string;
    locked: boolean; // pieces posees
    blocked: boolean; // ligne verouillee par adversaire
}


export interface spectrum {
    socketId: string;
    username: string;
    spectrum: number[];
    isAlive: boolean;
}