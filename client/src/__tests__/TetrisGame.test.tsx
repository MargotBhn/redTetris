import {render, screen, waitFor} from "@testing-library/react";
import {socketMiddleware} from "../middleware/socketMiddleware.ts"
import {act} from "react";
import TetrisGame from "../Components/TetrisGame.tsx";
import type {PieceType} from "server/dist/classes/Piece.ts";


jest.mock("../middleware/socketMiddleware.ts", () => ({
    socketMiddleware: {
        requestPieceBag: jest.fn(),
        sendGarbageLines: jest.fn(),
        onPieceBag: jest.fn(),
        onSpectrum: jest.fn(),
        onGarbageLines: jest.fn(),
        onEndOfGame: jest.fn(),
        getId: jest.fn(() => "mock-socket-id"),
        emitPlayerLost: jest.fn(),
        emitSpectrum: jest.fn(),
    }
}));

// ?? remplace les valeurs null ou undefined
// const renderGame = (props: { room?: string, isLeader?: boolean } = {}) => {
//     return render(<TetrisGame room={props.room ?? "test-room"} isLeader={props.isLeader ?? false}/>);
// };

const renderGame = (props: { room: string, isLeader: boolean }) => {
    return render(<TetrisGame room={props.room} isLeader={props.isLeader}/>);
};


const bagOfI: PieceType[] = Array(20).fill('I')
const bagOfO: PieceType[] = Array(20).fill('O')
const bagClearLines: PieceType[] = [
    ...Array(2).fill('I'),
    ...Array(1).fill('O'),
    ...Array(3).fill('S'),
]
const bagOfS: PieceType[] = Array(20).fill('S')


describe("TetrisGame", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("initalisation", () => {

        test('affichage de la page du jeu', () => {
            renderGame({room: "1", isLeader: false});
            expect(screen.getByTestId("tetris-game")).toBeInTheDocument();
        });

        test('Un piece s affiche', async () => {
            jest.mocked(socketMiddleware.onPieceBag).mockImplementation((callback) => {
                callback(bagOfI);
            })

            renderGame({room: "1", isLeader: false});

            await waitFor(() => {
                const board = screen.getByTestId("game-board");
                expect(board.querySelectorAll('[data-value="I"]').length).toBeGreaterThan(0);
            });

        });

    })
    describe("game", () => {
        beforeEach(() => {
            jest.useFakeTimers(); // c'est jest qui controle les timers
        });

        afterEach(() => {
            jest.useRealTimers(); // restaure les timer js
        });


        test('un piece descend toute seule jusqu en bas et une autre apparait', () => {
            // le bag contient un O puis des I
            // le but est de faire tomber la piece O jusqu'en bas, puis de verifier qu'on a bien 1 O et un I sur la grille
            const bagFall: PieceType[] = [
                ...Array(1).fill('O'),
                ...Array(20).fill('I')
            ]

            jest.mocked(socketMiddleware.onPieceBag).mockImplementation((callback) => {
                callback(bagFall);
            })
            renderGame({room: "1", isLeader: false});

            const board = screen.getByTestId("game-board");

            expect(board.querySelectorAll('[data-value="I"]').length).toBe(0);

            for (let i = 0; i < 21; i++) {
                act(() => {
                    jest.advanceTimersByTime(1000);
                });
            }


            expect(board.querySelectorAll('[data-value="I"]').length).toBeGreaterThan(0);
            expect(board.querySelectorAll('[data-value="O"]').length).toBeGreaterThan(0);


        })

        test('rotation d une piece', () => {
            jest.mocked(socketMiddleware.onPieceBag).mockImplementation((callback) => {
                callback(bagOfS);
            })
            renderGame({room: "1", isLeader: false});

            act(() => {
                jest.advanceTimersByTime(100);
            });

            const board = screen.getByTestId("game-board");
            const arrowUp = new KeyboardEvent("keydown", {key: "ArrowUp"});

            // Compter les S dans la grille avant rotation
            const cellsS = board.querySelectorAll('[data-value="S"]');

            expect(cellsS.length).toBe(4);

            // Faire une rotation
            act(() => {
                document.dispatchEvent(arrowUp);
                jest.advanceTimersByTime(100);
            });

            // Apres rotation, on a toujours les 4 cellules de S
            expect(board.querySelectorAll('[data-value="S"]').length).toBe(4);
        });

        test('deplacement impossible contre le bord gauche', () => {
            jest.mocked(socketMiddleware.onPieceBag).mockImplementation((callback) => {
                callback(bagOfO);
            })
            renderGame({room: "1", isLeader: false});

            act(() => {
                jest.advanceTimersByTime(100);
            });

            const arrowLeft = new KeyboardEvent("keydown", {key: "ArrowLeft"});

            // Deplacer la piece au bord gauche
            for (let i = 0; i < 10; i++) {
                act(() => {
                    document.dispatchEvent(arrowLeft);
                    jest.advanceTimersByTime(100);
                });
            }

            const board = screen.getByTestId("game-board");
            // La pièce O doit toujours avoir 4 cellules (pas de sortie de grille)
            expect(board.querySelectorAll('[data-value="O"]').length).toBe(4);
        });

        test('deplacement impossible contre le bord droit', () => {
            jest.mocked(socketMiddleware.onPieceBag).mockImplementation((callback) => {
                callback(bagOfO);
            })
            renderGame({room: "1", isLeader: false});

            act(() => {
                jest.advanceTimersByTime(100);
            });

            const arrowRight = new KeyboardEvent("keydown", {key: "ArrowRight"});

            // Deplacer la piece au bord droit
            for (let i = 0; i < 10; i++) {
                act(() => {
                    document.dispatchEvent(arrowRight);
                    jest.advanceTimersByTime(100);
                });
            }

            const board = screen.getByTestId("game-board");
            // La piece O doit toujours avoir 4 cellules
            expect(board.querySelectorAll('[data-value="O"]').length).toBe(4);
        });

        test('descente manuelle d une piece avec la touche bas', () => {
            jest.mocked(socketMiddleware.onPieceBag).mockImplementation((callback) => {
                callback(bagOfO);
            })
            renderGame({room: "1", isLeader: false});

            act(() => {
                jest.advanceTimersByTime(100);
            });

            const board = screen.getByTestId("game-board");
            const arrowDown = new KeyboardEvent("keydown", {key: "ArrowDown"});

            // La piece O est en haut de la grille (4 cellules visibles)
            expect(board.querySelectorAll('[data-value="O"]').length).toBe(4);

            // Appuyer sur la touche bas plusieurs fois pour faire descendre la piece
            for (let i = 0; i < 5; i++) {
                act(() => {
                    document.dispatchEvent(arrowDown);
                    jest.advanceTimersByTime(100);
                });
            }

            expect(board.querySelectorAll('[data-value="O"]').length).toBe(4);

            // Faire descendre jusqu en bas
            for (let i = 0; i < 20; i++) {
                act(() => {
                    document.dispatchEvent(arrowDown);
                    jest.advanceTimersByTime(100);
                });
            }

            // La piece O est maintenant fixée au sol et une nouvelle piece est arrivee
            expect(board.querySelectorAll('[data-value="O"]').length).toBeGreaterThan(4);
        });

        test('une ligne se complete', () => {
            jest.mocked(socketMiddleware.onPieceBag).mockImplementation((callback) => {
                callback(bagClearLines);
            })
            renderGame({room: "1", isLeader: false});

            // Avancer le temps pour que la première pièce apparaisse
            act(() => {
                jest.advanceTimersByTime(100);
            });

            const arrowLeft = new KeyboardEvent("keydown", {key: "ArrowLeft"});
            const arrowRight = new KeyboardEvent("keydown", {key: "ArrowRight"});
            const spaceBarre = new KeyboardEvent("keydown", {key: " "});

            // Decaler I de 3 a gauche puis espace
            // Decaler le I de 1 a droite puis espace
            // Decaler le O de 5 a droite puis espace
            // Une ligne est cree avec 2 I et un O sur la droite

            // Premier I
            for (let i = 0; i < 3; i++) {
                act(() => {
                    document.dispatchEvent(arrowLeft);
                    jest.advanceTimersByTime(100);
                });
            }
            act(() => {
                document.dispatchEvent(spaceBarre);
                jest.advanceTimersByTime(100);
            });

            // Deuxieme I
            act(() => {
                document.dispatchEvent(arrowRight);
                jest.advanceTimersByTime(100);
            });
            act(() => {
                document.dispatchEvent(spaceBarre);
                jest.advanceTimersByTime(100);
            });

            const board = screen.getByTestId("game-board");

            // Les I sont encore la
            expect(board.querySelectorAll('[data-value="I"]').length).toBeGreaterThan(0);

            // On ajoute le O pour completer la ligne
            for (let i = 0; i < 5; i++) {
                act(() => {
                    document.dispatchEvent(arrowRight);
                    jest.advanceTimersByTime(100);
                });
            }
            act(() => {
                document.dispatchEvent(spaceBarre);
                jest.advanceTimersByTime(100);
            });


            // les 2 I ont disparu car la ligne est complete
            expect(board.querySelectorAll('[data-value="I"]').length).toBe(0)
            // la partie haute du O est encore la
            expect(board.querySelectorAll('[data-value="O"]').length).toBeGreaterThan(0);

        });

        test('reception d une ligne garbage', () => {
            jest.mocked(socketMiddleware.onPieceBag).mockImplementation((callback) => {
                callback(bagOfO);
            })

            let onGarbageLinesCallback: ((numberLines: number) => void) | undefined;
            jest.mocked(socketMiddleware.onGarbageLines).mockImplementation((callback) => {
                onGarbageLinesCallback = callback;
            })

            renderGame({room: "1", isLeader: false});

            act(() => {
                jest.advanceTimersByTime(100);
            });

            const board = screen.getByTestId("game-board");

            // On n a pas encore les lignes bloquees
            expect(board.querySelectorAll('[data-value="B"]').length).toBe(0);

            // Ajouter des garbage lines en appelant le callback
            act(() => {
                onGarbageLinesCallback!(2);
            });

            expect(board.querySelectorAll('[data-value="B"]').length).toBe(20); // 2 lignes × 10 cellules
        })

        test('reception de garbage lines entrainant la fin de la partie', () => {
            jest.mocked(socketMiddleware.onPieceBag).mockImplementation((callback) => {
                callback(bagClearLines);
            })

            let onGarbageLinesCallback: ((numberLines: number) => void) | undefined;
            jest.mocked(socketMiddleware.onGarbageLines).mockImplementation((callback) => {
                onGarbageLinesCallback = callback;
            })

            renderGame({room: "1", isLeader: false});

            act(() => {
                jest.advanceTimersByTime(1100);
            });

            // Remplir la grid de garbage lines
            act(() => {
                onGarbageLinesCallback!(20);
            });

            expect(screen.getByText(/GAME OVER/)).toBeInTheDocument();
        })

    });


    describe("fin de la partie", () => {
        beforeEach(() => {
            jest.useFakeTimers(); // c'est jest qui controle les timers
        });

        afterEach(() => {
            jest.useRealTimers(); // restaure les timer js
        });

        test('End of game Lost', () => {

            jest.mocked(socketMiddleware.onPieceBag).mockImplementation((callback) => {
                callback(bagOfO);
            })
            renderGame({room: "1", isLeader: false});

            // Avancer le temps pour que la premiere piece apparaisse
            act(() => {
                jest.advanceTimersByTime(100);
            });

            // Faire tomber 11 pieces O pour remplir la grille
            for (let i = 0; i < 11; i++) {
                act(() => {
                    const event = new KeyboardEvent("keydown", {key: " "});
                    document.dispatchEvent(event);
                    jest.advanceTimersByTime(100);
                });
            }

            expect(screen.getByText(/GAME OVER/)).toBeInTheDocument();
        })

        test('End of game Winner not Leader', () => {
            let onEndOfGameCallback: ((winnerId: string) => void) | undefined;
            jest.mocked(socketMiddleware.onEndOfGame).mockImplementation((callback) => {
                onEndOfGameCallback = callback
            })

            renderGame({room: "1", isLeader: false});
            act(() => onEndOfGameCallback!('mock-socket-id'))
            expect(screen.getByText(/you won/i)).toBeInTheDocument();

        })

        test('End of game Winner Leader', () => {
            let onEndOfGameCallback: ((winnerId: string) => void) | undefined;
            jest.mocked(socketMiddleware.onEndOfGame).mockImplementation((callback) => {
                onEndOfGameCallback = callback
            })

            renderGame({room: "1", isLeader: true});
            act(() => onEndOfGameCallback!('mock-socket-id'))
            expect(screen.getByText(/you won/i)).toBeInTheDocument();
            expect(screen.getByText(/Start a new game/i)).toBeInTheDocument();

        })

    })


})

