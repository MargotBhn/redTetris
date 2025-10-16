import Game from '../classes/Game';
import Player from '../classes/Player';

// Mock de la classe Player
jest.mock('../classes/Player');

describe('Game', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game('test-room');
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('initialise la partie avec les bonnes valeurs', () => {
            expect(game.roomName).toBe('test-room');
            expect(game.players).toEqual([]);
            expect(game.pieceQueue).toHaveLength(1);
            expect(game.started).toBe(false);
            expect(game.isMultiplayer).toBe(false);
        });

        test('crée un premier sac de pièces au démarrage', () => {
            expect(game.pieceQueue.length).toBeGreaterThan(0);
        });
    });

    describe('Gestion des sacs de pièces', () => {
        test('getPieceBag retourne le premier sac', () => {
            const firstBag = game.getPieceBag(0);
            expect(firstBag).toHaveLength(7);
            expect(firstBag).toEqual(expect.arrayContaining(['I', 'O', 'T', 'S', 'Z', 'J', 'L']));
        });

        test('getPieceBag ajoute un nouveau sac quand on demande le dernier', () => {
            const initialLength = game.pieceQueue.length;
            game.getPieceBag(initialLength - 1);
            expect(game.pieceQueue.length).toBe(initialLength + 1);
        });

        test('chaque sac contient exactement les 7 pièces', () => {
            for (let i = 0; i < 5; i++) {
                const bag = game.getPieceBag(i);
                expect(bag).toHaveLength(7);
                const pieceCounts = bag!.reduce((acc: any, piece: string) => {
                    acc[piece] = (acc[piece] || 0) + 1;
                    return acc;
                }, {});
                Object.values(pieceCounts).forEach(count => {
                    expect(count).toBe(1);
                });
            }
        });

        test('les sacs sont mélangés différemment (au moins en général)', () => {
            const bag1 = game.getPieceBag(0);
            const bag2 = game.getPieceBag(1);
            // Les deux sacs ne sont probablement pas identiques
            // Note: il y a une petite chance qu'ils soient identiques par hasard
            const areSame = JSON.stringify(bag1) === JSON.stringify(bag2);
            expect(areSame).toBeFalsy();
        });

        test('pushNewBagToQueue ajoute un nouveau sac', () => {
            const initialLength = game.pieceQueue.length;
            game.pushNewBagToQueue();
            expect(game.pieceQueue.length).toBe(initialLength + 1);
        });
    });

    describe('Gestion des joueurs', () => {
        test('getPlayer retourne un joueur par son socketId', () => {
            const mockPlayer = {
                socketId: 'socket-1',
                name: 'Player1',
                spectrum: Array(10).fill(0),
                isAlive: true,
                bagIndex: 0,
                getBagIndex: jest.fn(),
                incrementBagIndex: jest.fn(),
            } as unknown as Player;

            game.players.push(mockPlayer);

            const foundPlayer = game.getPlayer('socket-1');
            expect(foundPlayer).toEqual(mockPlayer);
        });

        test('getPlayer retourne null si le joueur n\'existe pas', () => {
            const foundPlayer = game.getPlayer('non-existent');
            expect(foundPlayer).toBeNull();
        });

        test('getAllSpectrums retourne les spectrums de tous les joueurs', () => {
            const mockPlayer1 = {
                socketId: 'socket-1',
                name: 'Player1',
                spectrum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                isAlive: true,
            };
            const mockPlayer2 = {
                socketId: 'socket-2',
                name: 'Player2',
                spectrum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                isAlive: true,
            };

            game.players = [mockPlayer1 as unknown as Player, mockPlayer2 as unknown as Player];

            const spectrums = game.getAllSpectrums();

            expect(spectrums).toHaveLength(2);
            expect(spectrums[0]).toEqual({
                socketId: 'socket-1',
                username: 'Player1',
                spectrum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                isAlive: true,
            });
            expect(spectrums[1]).toEqual({
                socketId: 'socket-2',
                username: 'Player2',
                spectrum: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                isAlive: true,
            });
        });

        test('getAllSpectrums retourne un tableau vide si pas de joueurs', () => {
            const spectrums = game.getAllSpectrums();
            expect(spectrums).toEqual([]);
        });
    });

    describe('État multiplayer', () => {
        test('checkMultiplayer définit isMultiplayer à true avec 2 joueurs', () => {
            game.players = [
                { socketId: 'socket-1' } as unknown as Player,
                { socketId: 'socket-2' } as unknown as Player,
            ];
            game.checkMultiplayer();
            expect(game.isMultiplayer).toBe(true);
        });

        test('checkMultiplayer définit isMultiplayer à false avec 1 joueur', () => {
            game.players = [{ socketId: 'socket-1' } as unknown as Player];
            game.checkMultiplayer();
            expect(game.isMultiplayer).toBe(false);
        });

        test('checkMultiplayer définit isMultiplayer à false avec 0 joueurs', () => {
            game.players = [];
            game.checkMultiplayer();
            expect(game.isMultiplayer).toBe(false);
        });
    });

    describe('Comptage des joueurs vivants', () => {
        test('countAlivePlayers compte correctement les joueurs vivants', () => {
            game.players = [
                { socketId: 'socket-1', isAlive: true } as unknown as Player,
                { socketId: 'socket-2', isAlive: false } as unknown as Player,
                { socketId: 'socket-3', isAlive: true } as unknown as Player,
            ];

            const { count, lastSocketId } = game.countAlivePlayers();

            expect(count).toBe(2);
            expect(lastSocketId).toBe('socket-3');
        });

        test('countAlivePlayers retourne 0 si tous les joueurs sont morts', () => {
            game.players = [
                { socketId: 'socket-1', isAlive: false } as unknown as Player,
                { socketId: 'socket-2', isAlive: false } as unknown as Player,
            ];

            const { count } = game.countAlivePlayers();

            expect(count).toBe(0);
        });

        test('countAlivePlayers retourne le dernier joueur vivant', () => {
            game.players = [
                { socketId: 'socket-1', isAlive: true } as unknown as Player,
                { socketId: 'socket-2', isAlive: false } as unknown as Player,
                { socketId: 'socket-3', isAlive: false } as unknown as Player,
            ];

            const { count, lastSocketId } = game.countAlivePlayers();

            expect(count).toBe(1);
            expect(lastSocketId).toBe('socket-1');
        });
    });

    describe('Réinitialisation du jeu', () => {
        test('resetGame réinitialise correctement l\'état du jeu', () => {
            game.started = true;
            game.isMultiplayer = true;
            const mockPlayer = {
                socketId: 'socket-1',
                name: 'Player1',
                spectrum: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
                isAlive: false,
                bagIndex: 5,
            } as unknown as Player;
            game.players.push(mockPlayer);

            game.resetGame();

            expect(game.started).toBe(false);
            expect(game.pieceQueue.length).toBe(1);
            expect(mockPlayer.spectrum).toEqual(Array(10).fill(0));
            expect(mockPlayer.isAlive).toBe(true);
            expect(mockPlayer.bagIndex).toBe(0);
        });
    });

    describe('Fin de partie', () => {
        test('isEndOfGame retourne true en multijoueur quand 1 joueur reste', () => {
            game.isMultiplayer = true;
            game.players = [
                { socketId: 'socket-1', isAlive: true } as unknown as Player,
                { socketId: 'socket-2', isAlive: false } as unknown as Player,
            ];

            const { endOfGame, winner } = game.isEndOfGame();

            expect(endOfGame).toBe(true);
            expect(winner).toBe('socket-1');
        });

        test('isEndOfGame retourne false en multijoueur quand 2 joueurs sont vivants', () => {
            game.isMultiplayer = true;
            game.players = [
                { socketId: 'socket-1', isAlive: true } as unknown as Player,
                { socketId: 'socket-2', isAlive: true } as unknown as Player,
            ];

            const { endOfGame, winner } = game.isEndOfGame();

            expect(endOfGame).toBe(false);
            expect(winner).toBeNull();
        });

        test('isEndOfGame retourne true quand aucun joueur n\'est vivant', () => {
            game.players = [
                { socketId: 'socket-1', isAlive: false } as unknown as Player,
                { socketId: 'socket-2', isAlive: false } as unknown as Player,
            ];

            const { endOfGame, winner } = game.isEndOfGame();

            expect(endOfGame).toBe(true);
            expect(winner).toBeNull();
        });

        test('isEndOfGame retourne false en solo si le joueur est vivant', () => {
            game.isMultiplayer = false;
            game.players = [{ socketId: 'socket-1', isAlive: true } as unknown as Player];

            const { endOfGame, winner } = game.isEndOfGame();

            expect(endOfGame).toBe(false);
            expect(winner).toBeNull();
        });

        test('isEndOfGame retourne true en solo si le joueur est mort', () => {
            game.isMultiplayer = false;
            game.players = [{ socketId: 'socket-1', isAlive: false } as unknown as Player];

            const { endOfGame, winner } = game.isEndOfGame();

            expect(endOfGame).toBe(true);
            expect(winner).toBeNull();
        });
    });

    describe('Scénario complet', () => {
        test('simule une partie complète', () => {
            // Initialisation
            expect(game.started).toBe(false);

            // Ajouter des joueurs
            game.players = [
                {
                    socketId: 'socket-1',
                    name: 'Player1',
                    spectrum: Array(10).fill(0),
                    isAlive: true,
                    bagIndex: 0,
                } as unknown as Player,
                {
                    socketId: 'socket-2',
                    name: 'Player2',
                    spectrum: Array(10).fill(0),
                    isAlive: true,
                    bagIndex: 0,
                } as unknown as Player,
            ];

            // Vérifier le mode multijoueur
            game.checkMultiplayer();
            expect(game.isMultiplayer).toBe(true);

            // Démarrer la partie
            game.started = true;

            // Demander des pièces
            const bag0 = game.getPieceBag(0);
            expect(bag0).toHaveLength(7);

            // Un joueur perd
            game.players[0]!.isAlive = false;

            // Vérifier que la partie n'est pas terminée
            let { endOfGame } = game.isEndOfGame();
            expect(endOfGame).toBe(false);

            // L'autre joueur perd aussi
            game.players[1]!.isAlive = false;

            // Vérifier que la partie est terminée
            ({ endOfGame } = game.isEndOfGame());
            expect(endOfGame).toBe(true);

            // Réinitialiser pour une nouvelle partie
            game.resetGame();
            expect(game.started).toBe(false);
            expect(game.players[0]!.isAlive).toBe(true);
            expect(game.players[1]!.isAlive).toBe(true);
        });
    });
});