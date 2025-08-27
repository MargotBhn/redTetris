import {Server as HTTPServer} from 'node:http'
import {Server} from 'socket.io'
import Game from "./classes/Game.js";
import Player from "./classes/Player.js";


////// A FAIRE => Ranger dans des fonctions et fichiers separes ////////////////////

export function initSocket(server: HTTPServer) {
    console.log('init socket server')

    const games = new Map<string, Game>

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        }
    })

    ///////// PLAYER CONNECTION ///////////
    io.on('connection', (socket) => {
        console.log("Socket connected", socket.id);

        socket.on('joinRoom', (room: string, login: string, socketId: string) => {
            let game = games.get(room);

            if (game && game.started) {
                socket.emit('joinedError', false, false)
                return
            }

            //create new Game if needed
            if (!game) {
                game = new Game(room);
                games.set(room, game);
                console.log('Game created')
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
                        console.log('delete game because empty')
                        games.delete(room);
                    }
                    // Tells the others that one player left
                    else {
                        console.log(leavingPlayer!.name, " left the game")
                        if (leavingPlayer!.isLeader) {
                            game.players[0]!.isLeader = true
                            ///////////////// A FAIRE ///////////////////////////////////
                            io.to(game.players[0]!.socketId).emit('updateLeader', true)
                            /////////////////////////////////////////////////////////////
                        }
                        ///////////////// A FAIRE ///////////////////////////////////
                        io.to(room).emit('playerLeaving', leavingPlayer!.name);
                        /////////////////////////////////////////////////////////////


                    }
                }
            })

        })

        ///////////////// A VIRER //////////////////////////////////////////
        const message: any = "test message depuis le server"
        socket.emit('testMessage', message)

        // socket.on('disconnect', () => {
        //     console.log("Socket disconnected ", socket.id);
        // })
    })
}