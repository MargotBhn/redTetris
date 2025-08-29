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
            game = new Game(room);
            games.set(room, game);
        }

        let isLeader = false

        if (game.players.length === 0) {
            isLeader = true
        }
        const newPlayer: Player = new Player(login, socketId, isLeader)
        game.players.push(newPlayer)
        console.log('game = ', game)

        socket.join(room)

        socket.emit('joinedSuccess', newPlayer.isLeader)
        sendListPlayers(game, io)
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