import {Server, Socket} from "socket.io";
import Game from "../classes/Game.js";


export function updateNewLeader(io: Server, game: Game, socketId: string) {
    io.to(game.roomName).emit("newLeader", socketId);
}


export function handleGame(
    socket: Socket,
    games: Map<string, Game>,
    io: Server) {
    socket.on('startGame', (room: string) => {
        const game = games.get(room);
        if (game) {
            game.started = true;
            game.checkMultiplayer()
            const pieceBag = game.getPieceBag(0)
            io.to(room).emit("pieceBag", pieceBag)
            io.to(room).emit("gameStarts");
        }
    });

    socket.on('requestPieceBag', (room: string) => {

        const game = games.get(room);
        if (!game) return
        const player = game.getPlayer(socket.id)
        if (!player) return

        const pieceBagIndex = player.getBagIndex()
        const pieceBag = game.getPieceBag(pieceBagIndex)
        player.incrementBagIndex()
        socket.emit("pieceBag", pieceBag);
    })

    socket.on('addGarbageLines', (numberLines: number, room: string) => {
            const game = games.get(room);
            if (!game) return
            for (const player of game.players) {
                if (player.socketId !== socket.id) {
                    io.to(player.socketId).emit("garbageLines", numberLines)
                }
            }
        }
    )

    socket.on('spectrum', (spectrum: number[], room: string) => {
        const game = games.get(room);
        if (!game) return;

        const player = game.getPlayer(socket.id);
        if (!player) return;

        player.spectrum = spectrum;

        const allSpectrums = game.getAllSpectrums();
        io.to(room).emit("spectrums", allSpectrums);
    });

    socket.on('playerLost', (room: string) => {
        const game = games.get(room);
        if (!game) return
        const player = game.getPlayer(socket.id)
        if (!player) return;
        player.isAlive = false

        const allSpectrums = game.getAllSpectrums();
        io.to(room).emit("spectrums", allSpectrums);

        const {endOfGame, winner} = game.isEndOfGame()
        if (endOfGame) {
            io.to(room).emit("endOfGame", winner);
        }
    })

    socket.on('requestReturnLobby', (room: string) => {
        const game = games.get(room);
        if (!game) return
        game.resetGame();
        io.to(room).emit("GoLobby")
    })

}

