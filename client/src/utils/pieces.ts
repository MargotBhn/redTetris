import type {Piece, PieceType} from "../types/tetrisTypes.ts";
import {tetrominos} from "./piecesMatrix.ts";

export function createPiece(pieceType: PieceType) {
    const spawnY = pieceType == 'I' ? -1 : 0 // On remonte le I de 1, sinon il spawn trop bas
    return {
        type: pieceType,
        position: {x: 3, y: spawnY},
        rotation: 0,
        matrix: tetrominos[pieceType][0],
        color: getCellColor(pieceType),
    }
}

export function copyPiece(piece: Piece) {
    return {
        type: piece.type,
        position: {...piece.position},
        rotation: piece.rotation,
        matrix: piece.matrix.map((row) => [...row]),
        color: piece.color,
    }
}

export function getCellColor(value: string) {
    const colors: { [key: string]: string } = {
        'E': 'bg-gray-200', //empty
        'I': 'bg-cyan-500',
        'O': 'bg-yellow-500',
        'T': 'bg-purple-500',
        'S': 'bg-green-500',
        'Z': 'bg-red-500',
        'J': 'bg-blue-500',
        'L': 'bg-orange-500',
        'B': 'bg-gray-700', // Blocked
    };
    return colors[value];
}