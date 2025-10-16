import { Server, Socket } from 'socket.io';
import { updateNewLeader, handleGame } from '../sockets/gameSocket';
import Game from '../classes/Game';

// Mocks
jest.mock('socket.io');
jest.mock('../classes/Game');

describe('gameHandlers', () => {
    let mockSocket: jest.Mocked<Socket>;
    let mockIo: jest.Mocked<Server>;
    let mockGame: jest.Mocked<Game>;
    let games: Map<string, Game>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mocks
        mockSocket = {
            id: 'test-socket-id',
            on: jest.fn(),
            emit: jest.fn(),
        } as any;

        mockIo = {
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        } as any;

        mockGame = {
            roomName: 'test-room',
            started: false,
            players: [],
            pieceQueue: [['I', 'O', 'T', 'S', 'Z', 'J', 'L']],
            checkMultiplayer: jest.fn(),
            getPieceBag: jest.fn().mockReturnValue(['I', 'O', 'T', 'S', 'Z', 'J', 'L']),
            getPlayer: jest.fn(),
            getAllSpectrums: jest.fn().mockReturnValue([]),
            isEndOfGame: jest.fn().mockReturnValue({ endOfGame: false, winner: null }),
            resetGame: jest.fn(),
            countAlivePlayers: jest.fn(),
        } as any;

        games = new Map();
        games.set('test-room', mockGame);
    });

    describe('updateNewLeader', () => {
        test('émet l\'événement newLeader à tous les joueurs de la room', () => {
            updateNewLeader(mockIo, mockGame, 'new-leader-id');

            expect(mockIo.to).toHaveBeenCalledWith('test-room');
            expect(mockIo.emit).toHaveBeenCalledWith('newLeader', 'new-leader-id');
        });
    });

    describe('handleGame - startGame', () => {
        test('démarre le jeu et envoie le premier sac de pièces', () => {
            let startGameCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'startGame') startGameCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            startGameCallback('test-room');

            expect(mockGame.started).toBe(true);
            expect(mockGame.checkMultiplayer).toHaveBeenCalled();
            expect(mockGame.getPieceBag).toHaveBeenCalledWith(0);
            expect(mockIo.to).toHaveBeenCalledWith('test-room');
            expect(mockIo.emit).toHaveBeenCalledWith('pieceBag', ['I', 'O', 'T', 'S', 'Z', 'J', 'L']);
            expect(mockIo.emit).toHaveBeenCalledWith('gameStarts');
        });

        test('ne fait rien si la room n\'existe pas', () => {
            let startGameCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'startGame') startGameCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            startGameCallback('non-existent-room');

            expect(mockGame.started).not.toBe(true);
        });
    });

    describe('handleGame - requestPieceBag', () => {
        test('envoie un sac de pièces au joueur qui le demande', () => {
            const mockPlayer = {
                socketId: 'test-socket-id',
                getBagIndex: jest.fn().mockReturnValue(0),
                incrementBagIndex: jest.fn(),
            };
            mockGame.getPlayer.mockReturnValue(mockPlayer as any);

            let requestPieceBagCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'requestPieceBag') requestPieceBagCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            requestPieceBagCallback('test-room');

            expect(mockGame.getPlayer).toHaveBeenCalledWith('test-socket-id');
            expect(mockPlayer.getBagIndex).toHaveBeenCalled();
            expect(mockGame.getPieceBag).toHaveBeenCalledWith(0);
            expect(mockPlayer.incrementBagIndex).toHaveBeenCalled();
            expect(mockSocket.emit).toHaveBeenCalledWith('pieceBag', ['I', 'O', 'T', 'S', 'Z', 'J', 'L']);
        });

        test('ne fait rien si la room n\'existe pas', () => {
            let requestPieceBagCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'requestPieceBag') requestPieceBagCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            requestPieceBagCallback('non-existent-room');

            expect(mockGame.getPlayer).not.toHaveBeenCalled();
        });

        test('ne fait rien si le joueur n\'existe pas', () => {
            mockGame.getPlayer.mockReturnValue(null);

            let requestPieceBagCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'requestPieceBag') requestPieceBagCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            requestPieceBagCallback('test-room');

            expect(mockSocket.emit).not.toHaveBeenCalledWith('pieceBag', expect.anything());
        });
    });

    describe('handleGame - addGarbageLines', () => {
        test('envoie des lignes garbage à tous les autres joueurs', () => {
            const mockPlayer1 = { socketId: 'socket-1' };
            const mockPlayer2 = { socketId: 'socket-2' };
            mockGame.players = [mockPlayer1 as any, mockPlayer2 as any];
            // mockSocket.id = 'socket-1';

            let addGarbageLinesCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'addGarbageLines') addGarbageLinesCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            addGarbageLinesCallback(3, 'test-room');

            expect(mockIo.to).toHaveBeenCalledWith('socket-2');
            expect(mockIo.emit).toHaveBeenCalledWith('garbageLines', 3);
        });

        test('n\'envoie pas de lignes garbage au joueur qui les crée', () => {
            const mockPlayer = { socketId: 'socket-1' };
            mockGame.players = [mockPlayer as any];
            // mockSocket.id = 'socket-1';

            let addGarbageLinesCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'addGarbageLines') addGarbageLinesCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            addGarbageLinesCallback(3, 'test-room');

            expect(mockIo.emit).not.toHaveBeenCalledWith('garbageLines', 3);
        });

        test('ne fait rien si la room n\'existe pas', () => {
            let addGarbageLinesCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'addGarbageLines') addGarbageLinesCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            addGarbageLinesCallback(3, 'non-existent-room');

            expect(mockGame.players).not.toBeDefined();
        });
    });

    describe('handleGame - spectrum', () => {
        test('met à jour le spectrum du joueur et envoie à tous', () => {
            const mockPlayer = {
                socketId: 'test-socket-id',
                spectrum: Array(10).fill(0),
            };
            mockGame.getPlayer.mockReturnValue(mockPlayer as any);
            const spectrumData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            let spectrumCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'spectrum') spectrumCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            spectrumCallback(spectrumData, 'test-room');

            expect(mockGame.getPlayer).toHaveBeenCalledWith('test-socket-id');
            expect(mockPlayer.spectrum).toEqual(spectrumData);
            expect(mockGame.getAllSpectrums).toHaveBeenCalled();
            expect(mockIo.to).toHaveBeenCalledWith('test-room');
            expect(mockIo.emit).toHaveBeenCalledWith('spectrums', []);
        });

        test('ne fait rien si le joueur n\'existe pas', () => {
            mockGame.getPlayer.mockReturnValue(null);

            let spectrumCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'spectrum') spectrumCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            spectrumCallback([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'test-room');

            expect(mockGame.getAllSpectrums).not.toHaveBeenCalled();
        });
    });

    describe('handleGame - playerLost', () => {
        test('marque le joueur comme mort et vérifie la fin de partie', () => {
            const mockPlayer = {
                socketId: 'test-socket-id',
                isAlive: true,
            };
            mockGame.getPlayer.mockReturnValue(mockPlayer as any);
            mockGame.isEndOfGame.mockReturnValue({ endOfGame: false, winner: null });

            let playerLostCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'playerLost') playerLostCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            playerLostCallback('test-room');

            expect(mockPlayer.isAlive).toBe(false);
            expect(mockGame.getAllSpectrums).toHaveBeenCalled();
            expect(mockGame.isEndOfGame).toHaveBeenCalled();
            expect(mockIo.to).toHaveBeenCalledWith('test-room');
            expect(mockIo.emit).toHaveBeenCalledWith('spectrums', []);
        });

        test('émet endOfGame si la partie est terminée', () => {
            const mockPlayer = {
                socketId: 'test-socket-id',
                isAlive: true,
            };
            mockGame.getPlayer.mockReturnValue(mockPlayer as any);
            mockGame.isEndOfGame.mockReturnValue({ endOfGame: true, winner: 'socket-1' });

            let playerLostCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'playerLost') playerLostCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            playerLostCallback('test-room');

            expect(mockIo.emit).toHaveBeenCalledWith('endOfGame', 'socket-1');
        });

        test('ne fait rien si le joueur n\'existe pas', () => {
            mockGame.getPlayer.mockReturnValue(null);

            let playerLostCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'playerLost') playerLostCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            playerLostCallback('test-room');

            expect(mockGame.isEndOfGame).not.toHaveBeenCalled();
        });
    });

    describe('handleGame - requestReturnLobby', () => {
        test('réinitialise le jeu et renvoie à la lobby', () => {
            let returnLobbyCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'requestReturnLobby') returnLobbyCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            returnLobbyCallback('test-room');

            expect(mockGame.resetGame).toHaveBeenCalled();
            expect(mockIo.to).toHaveBeenCalledWith('test-room');
            expect(mockIo.emit).toHaveBeenCalledWith('GoLobby');
        });

        test('ne fait rien si la room n\'existe pas', () => {
            let returnLobbyCallback: any;
            mockSocket.on.mockImplementation((event, callback) => {
                if (event === 'requestReturnLobby') returnLobbyCallback = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);
            returnLobbyCallback('non-existent-room');

            expect(mockGame.resetGame).not.toHaveBeenCalled();
        });
    });

    describe('Scénario complet', () => {
        test('simule un flux de jeu complet', () => {
            const mockPlayer1 = {
                socketId: 'socket-1',
                isAlive: true,
                spectrum: Array(10).fill(0),
                getBagIndex: jest.fn().mockReturnValue(0),
                incrementBagIndex: jest.fn(),
            };
            const mockPlayer2 = {
                socketId: 'socket-2',
                isAlive: true,
                spectrum: Array(10).fill(0),
                getBagIndex: jest.fn().mockReturnValue(0),
                incrementBagIndex: jest.fn(),
            };
            mockGame.players = [mockPlayer1 as any, mockPlayer2 as any];

            const callbacks: { [key: string]: Function } = {};
            mockSocket.on.mockImplementation((event, callback) => {
                callbacks[event] = callback;
                return mockSocket;
            });

            handleGame(mockSocket, games, mockIo);

            // 1. Démarrer le jeu
            // mockSocket.id = 'socket-1';
            callbacks['startGame']!('test-room');
            expect(mockGame.started).toBe(true);

            // 2. Demander un sac de pièces
            mockGame.getPlayer.mockReturnValue(mockPlayer1 as any);
            callbacks['requestPieceBag']!('test-room');
            expect(mockPlayer1.incrementBagIndex).toHaveBeenCalled();

            // 3. Mettre à jour spectrum
            callbacks['spectrum']!([5, 5, 5, 5, 5, 5, 5, 5, 5, 5], 'test-room');
            expect(mockGame.getAllSpectrums).toHaveBeenCalled();

            // 4. Un joueur perd
            mockGame.isEndOfGame.mockReturnValue({ endOfGame: false, winner: null });
            callbacks['playerLost']!('test-room');
            expect(mockPlayer1.isAlive).toBe(false);

            // 5. Revenir à la lobby
            callbacks['requestReturnLobby']!('test-room');
            expect(mockGame.resetGame).toHaveBeenCalled();
        });
    });
});