import {useEffect, useState} from "react";
import {tetrominos} from "./Game";


// matrix[row][col]   | ->
// gameGrid[y][x]

type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Cell {
    value: string;
    color: string;
    locked: boolean;

}

interface PiecePosition {
    x: number,
    y: number
}

interface Piece {
    type: string,
    position: PiecePosition
    rotation: number,
    matrix: number[][]
}

function getRandomPiece(): Piece {
    const pieces: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
    const randomPieceIndex = Math.floor(Math.random() * pieces.length);
    const type = pieces[randomPieceIndex]
    const spawnY = type == 'I' ? -1 : 0
    return {
        type: type,
        position: {x: 3, y: spawnY},
        rotation: 0,
        matrix: tetrominos[type][0],
    }
}

function getCellColor(value: string) {
    const colors: { [key: string]: string } = {
        'E': 'bg-gray-200', //empty
        'I': 'bg-cyan-500',
        'O': 'bg-yellow-500',
        'T': 'bg-purple-500',
        'S': 'bg-green-500',
        'Z': 'bg-red-500',
        'J': 'bg-blue-500',
        'L': 'bg-orange-500',
        'B': 'bg-black-500', // Blocked
    };
    return colors[value];
}

function createEmptyGrid() {
    return Array(20).fill(0).map(() => Array(10).fill(0).map(() => ({
        color: "bg-gray-200",
        value: 'empty',
        locked: false,
    })));
}

function getNewGrid(grid: Cell[][], piece: Piece | null): Cell[][] {
    if (!piece)
        return grid

    const newGrid = grid.map(row => row.map(cell => ({...cell})))
    console.log(piece.matrix)

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

export default function TetrisGame() {
    const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid());
    const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);


    useEffect(() => {
        // const newGrid = grid.map(row => row.map(cell => ({...cell})));
        // newGrid[0][0] = {value: 1, color: getCellColor(1)}
        // newGrid[19][9] = {value: 1, color: getCellColor(1)}
        // setGrid(newGrid);
        setCurrentPiece(getRandomPiece())

    }, []);

    useEffect(() => {
        console.log(currentPiece);
        setGrid(getNewGrid(grid, currentPiece))
    }, [currentPiece]);


    return (
        <>
            <div className="flex items-center justify-center h-screen">
                <div className="border-2 border-black">
                    {grid.map((row, y) => (
                        <div key={y} className="flex">
                            {row.map((col, x) => (
                                <div key={x}
                                     className={`w-8 h-8 border-r border-b border-black ${col.color}`}></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}