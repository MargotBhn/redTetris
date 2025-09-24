import {useEffect, useRef, useState} from "react";
import {tetrominos} from "./Game";

// RULES
// End : The game ends when a new piece can no longer enter the field
// Completing a line causes it to disappear
// When a player clears lines, opponents receive n - 1 indestructible penalty lines
// at the bottom of their fields
// Players can see their opponents’ names and a "spectrum" view of their fields.

// matrix[row][col]   | ->
// gameGrid[y][x]

type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Cell {
    value: string;
    color: string;
    locked: boolean; // pieces posees
    blocked: boolean; // ligne verouillee par adversaire
}

interface PiecePosition {
    x: number,
    y: number
}

interface Piece {
    type: PieceType,
    position: PiecePosition
    rotation: number,
    matrix: number[][]
}

function getRandomPiece(): Piece {
    const pieces: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
    const randomPieceIndex = Math.floor(Math.random() * pieces.length);
    const type = pieces[randomPieceIndex]
    const spawnY = type == 'I' ? -1 : 0 // On remonte le I de 1, sinon il spawn trop bas
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
        value: 'E',
        locked: false,
        blocked: false,
    })));
}

function copyPiece(piece: Piece) {
    return {
        type: piece.type,
        position: {...piece.position},
        rotation: piece.rotation,
        matrix: piece.matrix.map((row) => [...row])
    }
}


function getNewGrid(grid: Cell[][], piece: Piece | null): Cell[][] {
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

function testMovementPossible(grid: Cell[][], piece: Piece) {
    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x] == 1) {
                const newY = y + piece.position.y
                const newX = x + piece.position.x
                if (newY > 19 || newY < 0 || newX > 9 || newX < 0) {
                    return false
                }
                if (grid[newY][newX].value !== 'E')
                    return false
            }
        }
    }
    return true
}

function fixPieceIntoGrid(piece: Piece | null, grid: Cell[][]) {
    console.log("grid avant", grid)
    console.log(piece)
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
    console.log("grid apres", grid)
    return grid
}

export default function TetrisGame() {
    const [fixedGrid, setFixedGrid] = useState<Cell[][]>(createEmptyGrid())
    const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid());
    const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
    const currentPieceRef = useRef<Piece | null>(null);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!currentPieceRef.current) {
            return
        }
        const newPiece: Piece = copyPiece(currentPieceRef.current)
        switch (event.key) {
            case 'a':
            case 'A':
            case'ArrowLeft' :
                newPiece.position.x -= 1
                if (testMovementPossible(fixedGrid, newPiece)) {
                    setCurrentPiece(newPiece)
                }
                break;
            case 'd' :
            case'D':
            case 'ArrowRight' :
                newPiece.position.x += 1
                if (testMovementPossible(fixedGrid, newPiece)) {
                    setCurrentPiece(newPiece)
                }
                break;
            case 'w':
            case'W':
            case'ArrowUp':
                if (newPiece.rotation == 3)
                    newPiece.rotation = 0
                else
                    newPiece.rotation++
                newPiece.matrix = tetrominos[newPiece.type][newPiece.rotation]
                if (testMovementPossible(fixedGrid, newPiece)) {
                    setCurrentPiece(newPiece)
                }
                break;
            case 's':
            case 'S':
            case 'ArrowDown':
                newPiece.position.y += 1
                console.log(currentPieceRef.current)
                if (testMovementPossible(fixedGrid, newPiece)) {
                    setCurrentPiece(newPiece)
                } else {
                    console.log(currentPieceRef.current)
                    setFixedGrid(prevGrid => (fixPieceIntoGrid(currentPieceRef.current, prevGrid)))
                    setCurrentPiece(getRandomPiece())
                }
                break;
        }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
        if (event.key !== 'ArrowDown' && event.key !== 's' && event.key !== 'S') {
            return
        }
    }


    useEffect(() => {
        setCurrentPiece(getRandomPiece())
        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('keyup', handleKeyUp)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
        }
    }, []);

    useEffect(() => {
        currentPieceRef.current = currentPiece;
        setGrid(getNewGrid(fixedGrid, currentPiece))
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