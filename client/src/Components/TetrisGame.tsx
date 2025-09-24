import {useEffect, useRef, useState} from "react";
import {tetrominos} from "./Pieces.ts";
import Board from "./Board.tsx";
import GameOver from "./GameOver.tsx";
import bgSimple from "../assets/BackgroundSimple.png";

// RULES
// End : The game ends when a new piece can no longer enter the field
// Completing a line causes it to disappear
// When a player clears lines, opponents receive n - 1 indestructible penalty lines
// at the bottom of their fields
// Players can see their opponents’ names and a "spectrum" view of their fields.

// matrix[row][col]   | ->
// gameGrid[y][x]

const GRID_HEIGHT = 20;
const GRID_WIDTH = 10;

type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Cell {
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
    return Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(0).map(() => ({
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

function fixPieceIntoGrid(piece: Piece | null, grid: Cell[][]) {
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

function gameIsLost(grid: Cell[][], piece: Piece | null) {
    if (!piece)
        return false

    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x] == 1) {
                if (grid[y + piece.position.y][x + piece.position.x].value !== 'E')
                    return true
            }
        }
    }
    return false
}

export default function TetrisGame() {
    const [fixedGrid, setFixedGrid] = useState<Cell[][]>(createEmptyGrid())
    const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid());
    const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
    const [gameLost, setGameLost] = useState(false)
    const currentPieceRef = useRef<Piece | null>(null);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (!currentPieceRef.current || gameLost) {
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
                if (testMovementPossible(fixedGrid, newPiece)) {
                    setCurrentPiece(newPiece)
                } else {
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
        if (gameLost) {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
        }
    }, [gameLost]);

    useEffect(() => {
        if (!gameLost) {
            currentPieceRef.current = currentPiece;
            if (gameIsLost(fixedGrid, currentPiece)) setGameLost(true)
            setGrid(getNewGrid(fixedGrid, currentPiece))
        }
    }, [currentPiece]);


    return (

        <div
            className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat overflow-hidden"
            style={{backgroundImage: `url(${bgSimple})`}}
        >
            <div className="flex flex-col items-center justify-center h-screen">
                {gameLost ? <GameOver/> : <div className='invisible'><GameOver/></div>}
                <div className="flex">
                    <Board grid={grid}/>
                    <div className="text-white">Mettre les autres players ici</div>
                </div>
            </div>
        </div>
    )
}