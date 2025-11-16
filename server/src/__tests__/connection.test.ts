import {Server, Socket} from 'socket.io';
import Game from '../classes/Game';
import {handlePlayerConnection} from "../sockets/connectionsSocket";
import Player from "../classes/Player";

// Mocks
jest.mock('socket.io');

describe('game Connection', () => {
    let mockSocket: jest.Mocked<Socket>;
    let mockIo: jest.Mocked<Server>;
    let games: Map<string, Game>;
    let joinRoomCallBack: (room: string, login: string) => void;
    let disconnectCallback: () => void

    beforeEach(() => {
        jest.clearAllMocks();


        // Setup mocks
        mockSocket = {
            id: 'test-socket-id',
            // on stocke dans des variables les callback de on 'joinRoom' et on 'disconnect' pour pouvoir les appeler manuellement en test
            on: jest.fn((event, callback) => {
                if (event === 'joinRoom') {
                    joinRoomCallBack = callback
                } else if (event === 'disconnect') {
                    disconnectCallback = callback
                }
            }),
            emit: jest.fn(),
            join: jest.fn(),
        } as any;

        mockIo = {
            // mockReturnThis() permet le chaînage : to() retourne mockIo
            // pour que io.to().emit() fonctionne.
            // Sans le return this, sur ce chainage on aura un emit sur undefined ce qui ne fonctionne pas
            to: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        } as any;

        games = new Map();
    });

    describe('Join Game', () => {
        test('Erreur en tentant de joindre une partie en cours', () => {

            const room = 'started-room'
            const startedGame = new Game(room)
            startedGame.started = true
            games.set(room, startedGame)

            handlePlayerConnection(mockSocket, games, mockIo)

            joinRoomCallBack(room, 'player')

            // player don't join room
            expect(mockSocket.join).not.toHaveBeenCalled()
            //return a error to player
            expect(mockSocket.emit).toHaveBeenCalledWith('joinError');
        });

        test('Si le player est deja dans une game, ne renvoie rien', () => {
            const room = 'room'
            const login = 'player1'

            const player: Player = new Player(login, 'test-socket-id', false)
            const game = new Game(room)
            game.players.push(player)

            games.set(room, game)

            handlePlayerConnection(mockSocket, games, mockIo)

            joinRoomCallBack(room, login)

            // rien ne se passe
            expect(mockSocket.join).not.toHaveBeenCalled();
            expect(mockSocket.emit).not.toHaveBeenCalled()
        });

        test('Player join une room avec succes', () => {
            const room = 'room'
            const login = 'player1'

            const game = new Game(room)
            games.set(room, game)

            handlePlayerConnection(mockSocket, games, mockIo)

            joinRoomCallBack(room, login)

            // player join room
            expect(mockSocket.join).toHaveBeenCalledWith(room)
            expect(mockSocket.emit).toHaveBeenCalledWith('joinedSuccess', true)

            // send new player list to all players
            expect(mockIo.to).toHaveBeenCalledWith(room)
            expect(mockIo.emit).toHaveBeenCalledWith('updatePlayersList', [{name: login, socketId: 'test-socket-id'}])

        })
    });

    describe('Disconnect', () => {
        test('leader se deconnecte, un nouveau joueur devient leader', () => {
            const player1 = new Player('player1', 'test-socket-id', true)
            const player2 = new Player('player2', 'socket-id-2', false)

            const room = 'room'

            const game = new Game(room)
            game.players.push(player1)
            game.players.push(player2)
            games.set(room, game)

            handlePlayerConnection(mockSocket, games, mockIo)

            // for now, player1 is leader, player2 is not
            expect(game.players[0]?.isLeader).toBe(true)
            expect(game.players[1]?.isLeader).toBe(false)

            // player 1 disconnect, player2 becomes new leader
            disconnectCallback()

            // check that there is only one player that is player2 and is Leader
            expect(game.players.length).toBe(1)
            expect(game.players[0]?.name).toBe('player2')
            expect(game.players[0]?.isLeader).toBe(true)

            // newLeader send to leader
            expect(mockIo.emit).toHaveBeenCalledWith('newLeader', 'socket-id-2');

            // send new player list to all players
            expect(mockIo.emit).toHaveBeenCalledWith('updatePlayersList', [{name: 'player2', socketId: 'socket-id-2'}])

        });

        test('le seul joueur de la game se deconnecte, la game est supprimee', () => {
            const player1 = new Player('player1', 'test-socket-id', true)
            const room = 'room'

            const game = new Game(room)
            game.players.push(player1)
            games.set(room, game)

            handlePlayerConnection(mockSocket, games, mockIo)

            // la game existe
            expect(games.get(room)).toBe(game)

            disconnectCallback()

            // le seul joueur quitte la game, elle est supprimee
            expect(games.get(room)).toBeUndefined()


        })


    })


})