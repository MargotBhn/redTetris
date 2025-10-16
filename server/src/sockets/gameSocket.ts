import {Server, Socket} from "socket.io";
import Game from "../classes/Game.js";
import Player from "../classes/Player";

export function sendListPlayers(
    game: Game,
    io: Server,
) {
    const players = game.players.map(player => ({name: player.name, socketId: player.socketId}));
    io.to(game.roomName).emit("updatePlayersList", players);
}

export function updateNewLeader(io: Server, game: Game, socketId: string) {
    io.to(game.roomName).emit("newLeader", socketId);
}

function countAlivePlayers(players: Player[]) {
    let count = 0
    let lastSocketId = ""
    for (const player of players) {
        if (player.isAlive) {
            count += 1;
            lastSocketId = player.socketId
        }
    }
    return {count, lastSocketId}
}

// Return if end of game and winner socket id if multiplayer
function isEndOfGame(game: Game): { endOfGame: boolean, winner: string | null } {
    const {count, lastSocketId} = countAlivePlayers(game.players);

    // if multiplayer, game ends when one player remains
    if (count === 1 && game.isMultiplayer)
        return {endOfGame: true, winner: lastSocketId}

    // if solo player, game end when he looses
    if (count === 0)
        return {endOfGame: true, winner: null}

    return {endOfGame: false, winner: null}
}


function getPlayer(socketId: string, game: Game): Player | null {
    for (const thisPlayer of game.players) {
        if (thisPlayer.socketId === socketId) {
            return thisPlayer;
        }
    }
    return null;
}

function isMultiplayer(game: Game) {
    return game.players.length !== 0;
}

function resetGame(game: Game) {
    game.pieceQueue = []
    game.pushNewBagToQueue()
    for (const player of game.players) {
        player.isAlive = true;
        player.spectrum = Array(10).fill(0)
        player.bagIndex = 0
    }
    game.started = false
}

export function handleGame(
    socket: Socket,
    games: Map<string, Game>,
    io: Server) {
    socket.on('startGame', (room: string) => {
        const game = games.get(room);
        if (game) {
            game.started = true;
            game.isMultiplayer = isMultiplayer(game)
            const pieceBag = game.getPieceBag(0)
            io.to(room).emit("pieceBag", pieceBag)
            io.to(room).emit("gameStarts");
        }
    });

    socket.on('requestPieceBag', (room: string) => {

        const game = games.get(room);
        if (!game) return
        const player = getPlayer(socket.id, game)
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
        const player = getPlayer(socket.id, game);

        if (!player) return;

        player.spectrum = spectrum;

        const allSpectrums = game.getAllSpectrums();
        io.to(room).emit("spectrums", allSpectrums);
    });

    socket.on('playerLost', (room: string) => {
        const game = games.get(room);
        if (!game) return
        const player = getPlayer(socket.id, game)
        if (!player) return;
        player.isAlive = false

        const allSpectrums = game.getAllSpectrums();
        io.to(room).emit("spectrums", allSpectrums);

        const {endOfGame, winner} = isEndOfGame(game)
        if (endOfGame) {
            io.to(room).emit("endOfGame", winner);
        }

    })

    socket.on('requestReturnLobby', (room: string) => {
        const game = games.get(room);

        if (!game) return
        resetGame(game);
        io.to(room).emit("GoLobby")
    })

}

