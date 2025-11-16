import {useCallback, useEffect, useRef, useState} from "react";
import {tetrominos} from "../utils/piecesMatrix.ts";
import Board from "./Board.tsx";
import GameOver from "./GameOver.tsx";
import bgSimple from "../assets/BackgroundSimple.png";
import NextPiece from "./NextPiece.tsx";
import {socketMiddleware} from "../middleware/socketMiddleware.ts";
import Spectrum from "./Spectrum.tsx";
import EndGame from "./EndGame.tsx";
import GameWon from "./GameWon.tsx";
import type {Cell, Piece, PieceType, spectrum} from "../types/tetrisTypes.ts";
import {calculateSpectrum} from "../utils/spectrum.ts";
import {copyPiece, createPiece} from "../utils/pieces.ts";
import {createEmptyGrid, fixPieceIntoGrid, getNewGrid} from "../utils/grid.ts";
import {addGarbageLine} from "../utils/garbageLines.ts";
import {forcePieceDown, gameIsLost, testMovementPossible} from "../utils/pieceMouvement.ts";
import {clearCompleteLines} from "../utils/lines.ts";


// RULES
// End : The game ends when a new piece can no longer enter the field
// Completing a line causes it to disappear
// When a player clears lines, opponents receive n - 1 indestructible penalty lines
// at the bottom of their fields
// Players can see their opponents' names and a "spectrum" view of their fields.

// matrix[row][col]   | ->
// gameGrid[y][x]

export const GRID_HEIGHT = 20;
export const GRID_WIDTH = 10;
const FALL_SPEED = 1000;


interface TetrisGameProps {
    room: string,
    isLeader: boolean,
}

export default function TetrisGame({room, isLeader}: TetrisGameProps) {
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

    const [opponentsSpectrums, setOpponentsSpectrums] = useState<spectrum[]>([]);

    const [endOfGame, setEndOfGame] = useState<boolean>(false);
    const [isWinner, setIsWinner] = useState<boolean>(false);


    // Quand on fixe la grid (une piece est tombee, on met a jour la ref)
    // On utilise une ref pour savoir si le changement vient d'une garbage line
    const isGarbageUpdateRef = useRef(false);

    useEffect(() => {
        if (gameLost) return
        fixedGridRef.current = fixedGrid
        // Ne pas incrémenter pieceIndex si c'est une garbage line
        if (!isGarbageUpdateRef.current) {
            setPieceIndex(prevPieceIndex => prevPieceIndex + 1)
        }
        isGarbageUpdateRef.current = false;
        const mySpectrum = calculateSpectrum(fixedGrid);
        socketMiddleware.emitSpectrum(mySpectrum, room);
    }, [fixedGrid, gameLost])


    useEffect(() => {
        pieceIndexRef.current = pieceIndex;
    }, [pieceIndex]);

    const fall = (newPiece: Piece) => {
        newPiece.position.y += 1
        if (testMovementPossible(fixedGridRef.current, newPiece)) {
            setCurrentPiece(newPiece)
        } else {
            const gridWithPiece = fixPieceIntoGrid(currentPieceRef.current, fixedGridRef.current)
            const {newGrid, linesCleared} = clearCompleteLines(gridWithPiece, room)

            setFixedGrid(newGrid)
            if (linesCleared > 0) {
                setScore(prevScore => prevScore + linesCleared)
            }
        }
    }

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
            if (!currentPieceRef.current) {
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
                case ' ': {
                    // 1. D'abord, on arrête complètement le timer
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }

                    // 2. On fixe la pièce
                    newPiece = forcePieceDown(fixedGridRef.current, newPiece)

                    const gridWithPiece = fixPieceIntoGrid(newPiece, fixedGridRef.current);
                    const {newGrid, linesCleared} = clearCompleteLines(gridWithPiece, room);

                    setFixedGrid(newGrid);
                    if (linesCleared > 0) {
                        setScore(prevScore => prevScore + linesCleared);
                    }

                    // 3. On redémarre le timer APRÈS (avec un petit délai pour être sûr)
                    setTimeout(() => {
                        setToggleTimer(prevToggleTimer => !prevToggleTimer);
                    }, 50);
                    break;
                }
            }
        }, []
    )

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (event.key !== 'ArrowDown' && event.key !== 's' && event.key !== 'S') {
            return
        }
    }, [])

    useEffect(() => {
        // if (gameLost) return;
        if (pieceBagRef.current) {
            setCurrentPiece(pieceBagRef.current[pieceIndex])
            setNextPiece(pieceBagRef.current[pieceIndex + 1])
        }

        // get new bag
        if (pieceIndex <= 0 || (pieceIndex % 7 >= 5 && pieceBagRef.current?.length <= pieceIndex + 3)) {
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
        }, FALL_SPEED);

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
            pieceBagRef.current = [...pieceBagRef.current, ...newBag]
            if (pieceIndexRef.current <= 0) {
                setPieceIndex(0)
                setCurrentPiece(pieceBagRef.current[0])
                setNextPiece(pieceBagRef.current[1])

            }
        })

        socketMiddleware.onSpectrum((spectrums: spectrum[]) => {
            const mySocketId = socketMiddleware.getId()
            const spectrumExceptMine = spectrums.filter(spectrum => spectrum.socketId != mySocketId)
            setOpponentsSpectrums(spectrumExceptMine);
        })
        socketMiddleware.requestPieceBag(room)

        socketMiddleware.onGarbageLines((numberLines: number) => {
            isGarbageUpdateRef.current = true;
            const {
                newGrid,
                newPiece,
                playerLost
            } = addGarbageLine(fixedGridRef.current, currentPieceRef.current, numberLines);
            currentPieceRef.current = newPiece
            setFixedGrid(newGrid);
            if (newPiece) {
                setCurrentPiece(newPiece);
            }
            if (playerLost)
                setGameLost(playerLost)
        })

        socketMiddleware.onEndOfGame((winner: string) => {
            if (winner === socketMiddleware.getId()) {
                setIsWinner(true)
            }
            setEndOfGame(true)
        })

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
        }
    }, []);

    useEffect(() => {
        if (gameLost) {
            socketMiddleware.emitPlayerLost(room)
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('keyup', handleKeyUp)
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [gameLost]);

    useEffect(() => {
        currentPieceRef.current = currentPiece;
        if (gameIsLost(fixedGridRef.current, currentPiece)) {
            const newFixedGrid = fixPieceIntoGrid(currentPieceRef.current, fixedGridRef.current)
            const mySpectrum = calculateSpectrum(newFixedGrid);
            socketMiddleware.emitSpectrum(mySpectrum, room);
            setGameLost(true)
        }
        setGrid(getNewGrid(fixedGridRef.current, currentPiece))
    }, [currentPiece]);

    return (

        <div
            className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat overflow-hidden"
            style={{backgroundImage: `url(${bgSimple})`}}
        >

            <div data-testid="tetris-game" className="flex flex-col items-center justify-center h-screen">
                <div>{endOfGame && isLeader && room && <EndGame room={room}/>}</div>
                {gameLost ? (
                    <GameOver/>
                ) : isWinner ? (
                    <GameWon/>
                ) : null}

                <div className="text-white text-2xl mb-4">Score: {score}</div>

                <div className="flex">
                    {/* Grille de spectrums avec alignement à droite */}
                    <div
                        className="grid gap-2 mr-4 content-start max-h-screen overflow-y-auto"
                        style={{
                            gridTemplateColumns: `repeat(${Math.min(opponentsSpectrums.length, 5)}, minmax(80px, auto))`,
                        }}
                    >
                        {opponentsSpectrums.map(spectrum => (
                            <div key={spectrum.socketId}>
                                <Spectrum
                                    playerName={spectrum.username}
                                    heights={spectrum.spectrum}
                                    isAlive={spectrum.isAlive}
                                />
                            </div>
                        ))}
                    </div>

                    <Board grid={grid}/>

                    <div className="flex flex-col">
                        <NextPiece piece={nextPiece}/>
                    </div>
                </div>
            </div>
        </div>
    )
}