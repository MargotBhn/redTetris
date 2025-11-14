import {Server, Socket} from 'socket.io';
import {updateNewLeader, handleGame} from '../sockets/gameSocket';
import Game from '../classes/Game';
import {handlePlayerConnection} from "../sockets/connectionsSocket";

// Mocks
jest.mock('socket.io');
jest.mock('../classes/Game');

describe('game Connection', () => {
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
            // mockReturnThis() permet le chaînage : to() retourne mockIo
            // pour que io.to().emit() fonctionne.
            // Sans le return this, sur ce chainage on aura un emit sur undefined ce qui ne fonctionne pas
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
            isEndOfGame: jest.fn().mockReturnValue({endOfGame: false, winner: null}),
            resetGame: jest.fn(),
            countAlivePlayers: jest.fn(),
        } as any;

        games = new Map();
        games.set('test-room', mockGame);
    });

    describe('Game connection', () => {
        test('Erreur en tentant de joindre une partie en cours', () => {
            //game started a true
            const startedGame = {
                ...mockGame,
                roomName: 'test-room',
                started: true,
            } as Game;

            handlePlayerConnection(mockSocket, startedGame, mockIo)


            expect(mockSocket.emit).toHaveBeenCalledWith('joinError');
        })

    })
})