import {useCallback, useEffect, useRef, useState} from "react";
import {tetrominos} from "./Pieces.ts";
import Board from "./Board.tsx";
import GameOver from "./GameOver.tsx";
import bgSimple from "../assets/BackgroundSimple.png";
import NextPiece from "./NextPiece.tsx";
import {socketMiddleware} from "../middleware/socketMiddleware.ts";
// import type {PieceType} from "../middleware/socketMiddleware.ts";


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

export interface Piece {
    type: PieceType,
    position: PiecePosition
    rotation: number,
    matrix: number[][],
    color: string
}

// function getPieceBag(): Piece[] {
//     let bag = []
//     for (let i = 0; i < 7; i++) {
//         bag.push(getRandomPiece());
//     }
//     return bag
// }

// function getRandomPiece(): Piece {
//     const pieces: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
//     const randomPieceIndex = Math.floor(Math.random() * pieces.length);
//     const type = pieces[randomPieceIndex]
//     const spawnY = type == 'I' ? -1 : 0 // On remonte le I de 1, sinon il spawn trop bas
//     return {
//         type: type,
//         position: {x: 3, y: spawnY},
//         rotation: 0,
//         matrix: tetrominos[type][0],
//         color: getCellColor(type),
//     }
// }

function createPiece(pieceType: PieceType) {
    const spawnY = pieceType == 'I' ? -1 : 0 // On remonte le I de 1, sinon il spawn trop bas
    return {
        type: pieceType,
        position: {x: 3, y: spawnY},
        rotation: 0,
        matrix: tetrominos[pieceType][0],
        color: getCellColor(pieceType),
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
        matrix: piece.matrix.map((row) => [...row]),
        color: piece.color,
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

function forcePieceDown(grid: Cell[][], piece: Piece): Piece {
    for (let boardY = GRID_HEIGHT - 1; boardY >= 0; boardY--) {
        piece.position.y = boardY
        if (testMovementPossible(grid, piece)) {
            return piece
        }
    }
    return piece

}

function gameIsLost(grid: Cell[][], piece: Piece | null) {
    if (!piece)
        return false

    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece?.matrix[y][x] == 1) {
                if (grid[y + piece?.position.y][x + piece?.position.x].value !== 'E') {
                    return true
                }
            }
        }
    }
    return false
}

function clearCompleteLines(grid: Cell[][]) {

    let linesCleared = 0;
    const newGrid = grid.filter((row) => {
        const isComplete = row.every(cell => cell.value !== 'E');
        if (isComplete) {
            linesCleared++;
            return false;
        }
        return true;
    });
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
    return {newGrid, linesCleared};
}

interface TetrisGameProps {
    room: string | undefined
}

export default function TetrisGame({room}: TetrisGameProps) {
    const [fixedGrid, setFixedGrid] = useState<Cell[][]>(createEmptyGrid())
    const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid());

    const [pieceIndex, setPieceIndex] = useState<number>(-1);
    const pieceIndexRef = useRef(0)
    const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
    const [nextPiece, setNextPiece] = useState<Piece | null>(null);
    const pieceBagRef = useRef<Piece[]>([]);

    const [score, setScore] = useState<number>(0);

    const [gameLost, setGameLost] = useState(false)
    const currentPieceRef = useRef<Piece | null>(null);
    const [toggleTimer, setToggleTimer] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const lastInputTimeRef = useRef(0);
    const fixedGridRef = useRef<Cell[][]>([]);
    const INPUT_DELAY = 100;


    // Quand on fixe la grid (une piece est tombee, on met a jour la ref)
    useEffect(() => {
        fixedGridRef.current = fixedGrid
        setPieceIndex(prevPieceIndex => prevPieceIndex + 1)
    }, [fixedGrid])


    useEffect(() => {
        pieceIndexRef.current = pieceIndex;
    }, [pieceIndex]);

    const fall = (newPiece: Piece) => {
        newPiece.position.y += 1
        if (testMovementPossible(fixedGridRef.current, newPiece)) {
            setCurrentPiece(newPiece)
        } else {
            const gridWithPiece = fixPieceIntoGrid(currentPieceRef.current, fixedGridRef.current)
            const {newGrid, linesCleared} = clearCompleteLines(gridWithPiece)

            setFixedGrid(newGrid)
            if (linesCleared > 0) {
                setScore(prevScore => prevScore + linesCleared)
            }
        }
    }

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
            if (!currentPieceRef.current || gameLost) {
                return
            }
            const now = Date.now();
            if (now - lastInputTimeRef.current < INPUT_DELAY) return;
            lastInputTimeRef.current = now;
            let newPiece: Piece = copyPiece(currentPieceRef.current)
            switch (event.key) {
                case 'a':
                case 'A':
                case'ArrowLeft' :
                    newPiece.position.x -= 1
                    if (testMovementPossible(fixedGridRef.current, newPiece)) {
                        setCurrentPiece(newPiece)
                    }
                    break;
                case 'd' :
                case'D':
                case 'ArrowRight' :
                    newPiece.position.x += 1
                    if (testMovementPossible(fixedGridRef.current, newPiece)) {
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
                    if (testMovementPossible(fixedGridRef.current, newPiece)) {
                        setCurrentPiece(newPiece)
                    }
                    break;
                case 's':
                case 'S':
                case 'ArrowDown':
                    setToggleTimer(prevToggleTimer => !prevToggleTimer)
                    setTimeout(() => fall(newPiece), 0)
                    break;
                case ' ':
                    setToggleTimer(!toggleTimer)
                    newPiece = forcePieceDown(fixedGridRef.current, newPiece)

                    const gridWithPiece = fixPieceIntoGrid(newPiece, fixedGridRef.current);
                    const {newGrid, linesCleared} = clearCompleteLines(gridWithPiece);

                    setFixedGrid(newGrid);
                    if (linesCleared > 0) {
                        setScore(prevScore => prevScore + linesCleared);
                    }
                    break;
            }
        }, []
    )

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (event.key !== 'ArrowDown' && event.key !== 's' && event.key !== 'S') {
            return
        }
    }, [])

    useEffect(() => {
        if (gameLost) return;
        if (pieceBagRef.current) {
            setCurrentPiece(pieceBagRef.current[pieceIndex])
            setNextPiece(pieceBagRef.current[pieceIndex + 1])
        }


        // get new bag
        if (pieceIndex % 7 >= 5 && pieceBagRef.current?.length <= pieceIndex + 3 && room) {
            socketMiddleware.requestPieceBag(room)
        }
    }, [pieceIndex]);


    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        timerRef.current = setInterval(() => {
            if (currentPieceRef.current)
                fall(copyPiece(currentPieceRef.current));
        }, 1000);
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [toggleTimer]);


    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('keyup', handleKeyUp)

        socketMiddleware.onPieceBag((bag: PieceType[]) => {
            const newBag: Piece[] = bag.map((piece: PieceType) => createPiece(piece))
            // console.log('new bag received', newBag)
            pieceBagRef.current = [...pieceBagRef.current, ...newBag]
            if (pieceIndexRef.current < 0) {
                setPieceIndex(0)
                setCurrentPiece(pieceBagRef.current[0])
                setNextPiece(pieceBagRef.current[1])

            }
        })
        if (room)
            socketMiddleware.requestPieceBag(room)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
        }
    }, []);

    useEffect(() => {
        if (gameLost) {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
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
            <span>{pieceIndex}</span>

            <div className="flex flex-col items-center justify-center h-screen">
                {gameLost ? <GameOver/> : <div className='invisible'><GameOver/></div>}
                <div className="text-white text-2xl mb-4">Score: {score}</div>
                <div className="flex">
                    <div className="text-white">Mettre les autres players ici</div>
                    <Board grid={grid}/>
                    <div className="flex flex-col">
                        {/*<div className="flex justify-center">*/}
                        <NextPiece piece={nextPiece}/>
                        {/*</div>*/}

                    </div>
                </div>
            </div>
        </div>
    )
}