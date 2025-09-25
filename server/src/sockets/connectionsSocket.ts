import Game from "../classes/Game.js";
import {Server, Socket} from "socket.io";
import Player from "../classes/Player.js";
import {sendListPlayers, updateNewLeader} from "./gameSocket.js";
import player from "../classes/Player.js";


export function handlePlayerConnection(
    socket: Socket,
    games: Map<string, Game>,
    io: Server) {

    socket.on('joinRoom', (room: string, login: string, socketId: string) => {
        let game = games.get(room);

        if (game && game.started) {
            socket.emit('joinError')
            return
        }
        if (game) {
            for (const player of game.players) {
                if (player.socketId === socket.id) {
                    return
                }
            }
        }

        if (!game) {
            // console.log(`[Game:create] Creating new Game for room="${room}"`);
            game = new Game(room);
            // console.log(`[Game:create] pieceQueue initial length=${game.pieceQueue.length}`);
            // console.log(`[Game:create] pieceQueue first two bags:`, {
            //     bag1: game.pieceQueue.slice(0, 7),
            //     bag2: game.pieceQueue.slice(7, 14),
            // });
            games.set(room, game);
        }

        let isLeader = false

        if (game.players.length === 0) {
            isLeader = true
        }
        const newPlayer: Player = new Player(login, socketId, isLeader)
        game.players.push(newPlayer)
        // console.log('[Game:state] room=', room, 'players=', game.players.length, 'started=', game.started);
        // console.log('[Game:state] pieceQueue length=', game.pieceQueue.length);
        // console.log('[Game:state] first two bags:', {
        //     bag1: game.pieceQueue.slice(0, 7),
        //     bag2: game.pieceQueue.slice(7, 14),
        // });

        socket.join(room)

        socket.emit('joinedSuccess', newPlayer.isLeader)
        sendListPlayers(game, io)

        // Émettre immédiatement l'état courant de la file des pièces (regroupée par sacs de 7)
        {
            const queue = Array.isArray((game as any).pieceQueue)
                ? ((game as any).pieceQueue as string[])
                : [];

            const bags: string[][] = [];
            for (let i = 0; i < queue.length; i += 7) {
                bags.push(queue.slice(i, i + 7));
            }

            socket.emit('pieces:queue', { bags, total: queue.length });
        }
    })

    ///////// PLAYER DISCONNECTION ///////////
    socket.on('disconnect', () => {

        games.forEach((game, room) => {
            const playerIndex = game.players.findIndex(player => player.socketId === socket.id);

            if (playerIndex !== -1) {
                const leavingPlayer = game.players[playerIndex];
                game.players.splice(playerIndex, 1);


                //delete empty game
                if (game.players.length === 0) {
                    games.delete(room);
                }
                // Tells the others that one player left
                else {
                    if (leavingPlayer!.isLeader) {
                        game.players[0]!.isLeader = true
                        updateNewLeader(io, game, game.players[0]!.socketId)
                    }
                    sendListPlayers(game, io)
                }
            }
        })

    })
}