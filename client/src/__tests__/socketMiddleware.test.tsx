import { socketMiddleware } from '../middleware/socketMiddleware.ts';
import * as ioClient from 'socket.io-client';

// Mock socket.io-client
jest.mock('socket.io-client');

const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    removeAllListeners: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
    id: 'test-socket-id-123',
};

describe('socketMiddleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (ioClient.io as jest.Mock).mockReturnValue(mockSocket);
        // Réinitialiser le middleware en le reconnectant
        socketMiddleware.disconnect();
    });

    afterEach(() => {
        socketMiddleware.disconnect();
    });

    describe('connect', () => {
        test('établit une connexion à localhost:3000', () => {
            socketMiddleware.connect();

            expect(ioClient.io).toHaveBeenCalledWith('http://localhost:3000');
        });

        test('déconnecte la socket existante avant de se reconnecter', () => {
            socketMiddleware.connect();
            socketMiddleware.connect();

            expect(mockSocket.disconnect).toHaveBeenCalled();
            expect(ioClient.io).toHaveBeenCalledTimes(2);
        });
    });

    describe('isConnected', () => {
        test('retourne true quand la socket est connectée', () => {
            socketMiddleware.connect();

            expect(socketMiddleware.isConnected()).toBe(true);
        });

        test('retourne false quand la socket est déconnectée', () => {
            mockSocket.connected = false;
            socketMiddleware.connect();

            expect(socketMiddleware.isConnected()).toBe(false);
        });

        test('retourne false avant connexion', () => {
            expect(socketMiddleware.isConnected()).toBe(false);
        });
    });

    describe('getId', () => {
        test('retourne l\'ID de la socket', () => {
            socketMiddleware.connect();

            expect(socketMiddleware.getId()).toBe('test-socket-id-123');
        });

        test('retourne undefined avant connexion', () => {
            expect(socketMiddleware.getId()).toBeUndefined();
        });
    });

    describe('disconnect', () => {
        test('supprime tous les listeners et déconnecte la socket', () => {
            socketMiddleware.connect();
            socketMiddleware.disconnect();

            expect(mockSocket.removeAllListeners).toHaveBeenCalled();
            expect(mockSocket.disconnect).toHaveBeenCalled();
        });

        test('ne fait rien si pas de socket active', () => {
            expect(() => socketMiddleware.disconnect()).not.toThrow();
        });

        test('réinitialise l\'ID après déconnexion', () => {
            socketMiddleware.connect();
            socketMiddleware.disconnect();

            expect(socketMiddleware.getId()).toBeUndefined();
        });
    });

    describe('Événements de salle (Room)', () => {
        beforeEach(() => {
            socketMiddleware.connect();
        });

        test('emitJoinRoom émet l\'événement joinRoom avec room et login', () => {
            socketMiddleware.emitJoinRoom('room-1', 'player-1');

            expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', 'room-1', 'player-1');
        });

        test('onJoinError écoute l\'événement joinError', () => {
            const callback = jest.fn();
            socketMiddleware.onJoinError(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('joinError', callback);
        });

        test('onJoinSuccess écoute l\'événement joinedSuccess', () => {
            const callback = jest.fn();
            socketMiddleware.onJoinSuccess(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('joinedSuccess', callback);
        });

        test('onUpdatePlayerList écoute l\'événement updatePlayersList', () => {
            const callback = jest.fn();
            socketMiddleware.onUpdatePlayerList(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('updatePlayersList', callback);
        });

        test('onNewLeader écoute l\'événement newLeader', () => {
            const callback = jest.fn();
            socketMiddleware.onNewLeader(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('newLeader', callback);
        });
    });

    describe('Événements de jeu', () => {
        beforeEach(() => {
            socketMiddleware.connect();
        });

        test('emitStartGame émet l\'événement startGame', () => {
            socketMiddleware.emitStartGame('room-1');

            expect(mockSocket.emit).toHaveBeenCalledWith('startGame', 'room-1');
        });

        test('onGameStarts écoute l\'événement gameStarts', () => {
            const callback = jest.fn();
            socketMiddleware.onGameStarts(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('gameStarts', callback);
        });

        test('emitPlayerLost émet l\'événement playerLost', () => {
            socketMiddleware.emitPlayerLost('room-1');

            expect(mockSocket.emit).toHaveBeenCalledWith('playerLost', 'room-1');
        });

        test('onEndOfGame écoute l\'événement endOfGame', () => {
            const callback = jest.fn();
            socketMiddleware.onEndOfGame(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('endOfGame', callback);
        });
    });

    describe('Événements de pièces', () => {
        beforeEach(() => {
            socketMiddleware.connect();
        });

        test('requestPieceBag émet l\'événement requestPieceBag', () => {
            socketMiddleware.requestPieceBag('room-1');

            expect(mockSocket.emit).toHaveBeenCalledWith('requestPieceBag', 'room-1');
        });

        test('onPieceBag écoute l\'événement pieceBag', () => {
            const callback = jest.fn();
            socketMiddleware.onPieceBag(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('pieceBag', callback);
        });
    });

    describe('Événements de garbage lines', () => {
        beforeEach(() => {
            socketMiddleware.connect();
        });

        test('sendGarbageLines émet l\'événement addGarbageLines', () => {
            socketMiddleware.sendGarbageLines(3, 'room-1');

            expect(mockSocket.emit).toHaveBeenCalledWith('addGarbageLines', 3, 'room-1');
        });

        test('onGarbageLines écoute l\'événement garbageLines', () => {
            const callback = jest.fn();
            socketMiddleware.onGarbageLines(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('garbageLines', callback);
        });
    });

    describe('Événements de spectrum', () => {
        beforeEach(() => {
            socketMiddleware.connect();
        });

        test('emitSpectrum émet l\'événement spectrum', () => {
            const spectrumData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            socketMiddleware.emitSpectrum(spectrumData, 'room-1');

            expect(mockSocket.emit).toHaveBeenCalledWith('spectrum', spectrumData, 'room-1');
        });

        test('onSpectrum écoute l\'événement spectrums', () => {
            const callback = jest.fn();
            socketMiddleware.onSpectrum(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('spectrums', callback);
        });
    });

    describe('Événements de lobby', () => {
        beforeEach(() => {
            socketMiddleware.connect();
        });

        test('emitReturnLobby émet l\'événement requestReturnLobby', () => {
            socketMiddleware.emitReturnLobby('room-1');

            expect(mockSocket.emit).toHaveBeenCalledWith('requestReturnLobby', 'room-1');
        });

        test('onReturnLobby écoute l\'événement GoLobby', () => {
            const callback = jest.fn();
            socketMiddleware.onReturnLobby(callback);

            expect(mockSocket.on).toHaveBeenCalledWith('GoLobby', callback);
        });
    });

    describe('Sécurité - pas de socket', () => {
        test('emitJoinRoom ne fait rien sans socket', () => {
            socketMiddleware.emitJoinRoom('room-1', 'player-1');

            expect(mockSocket.emit).not.toHaveBeenCalled();
        });

        test('onJoinError ne fait rien sans socket', () => {
            const callback = jest.fn();
            socketMiddleware.onJoinError(callback);

            expect(mockSocket.on).not.toHaveBeenCalled();
        });

        test('requestPieceBag ne fait rien sans socket', () => {
            socketMiddleware.requestPieceBag('room-1');

            expect(mockSocket.emit).not.toHaveBeenCalled();
        });
    });

    // describe('Intégration - scénario complet', () => {
    //     test('simule un flux complet de jeu', () => {
    //         // Connexion
    //         socketMiddleware.connect();
    //         expect(socketMiddleware.isConnected()).toBe(true);
    //         expect(socketMiddleware.getId()).toBe('test-socket-id-123');
    //
    //         // Rejoindre une salle
    //         socketMiddleware.emitJoinRoom('tetris-room', 'john');
    //         expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', 'tetris-room', 'john');
    //
    //         // Écouter le succès
    //         const onSuccessCallback = jest.fn();
    //         socketMiddleware.onJoinSuccess(onSuccessCallback);
    //         expect(mockSocket.on).toHaveBeenCalledWith('joinedSuccess', onSuccessCallback);
    //
    //         // Démarrer le jeu
    //         socketMiddleware.emitStartGame('tetris-room');
    //         expect(mockSocket.emit).toHaveBeenCalledWith('startGame', 'tetris-room');
    //
    //         // Demander des pièces
    //         socketMiddleware.requestPieceBag('tetris-room');
    //         expect(mockSocket.emit).toHaveBeenCalledWith('requestPieceBag', 'tetris-room');
    //
    //         // Déconnexion
    //         socketMiddleware.disconnect();
    //         expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    //         expect(mockSocket.disconnect).toHaveBeenCalled();
    //         expect(socketMiddleware.isConnected()).toBe(false);
    //     });
    // });
});