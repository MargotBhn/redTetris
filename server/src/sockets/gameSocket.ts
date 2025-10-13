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

// export function sendSpectrums(
//     game: Game,
//     io: Server,
//     targetSocket?: Socket
// ) {
//     const payload = game.players.map(p => ({
//         socketId: p.socketId,
//         name: p.name,
//         spectrum: Array.isArray((p as any).spectrum) ? (p as any).spectrum : Array(10).fill(0)
//     }));
//     if (targetSocket) {
//         targetSocket.emit('spectrums:update', payload);
//     } else {
//         io.to(game.roomName).emit('spectrums:update', payload);
//     }
// }

// Helper: chunk an array into bags of size 7
// function chunkIntoBags<T>(arr: T[], size = 7): T[][] {
//     const out: T[][] = [];
//     for (let i = 0; i < arr.length; i += size) {
//         out.push(arr.slice(i, i + size));
//     }
//     return out;
// }

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
function isEndOfGame(game: Game) : {endOfGame: boolean, winner:string | null} {
    const {count, lastSocketId} = countAlivePlayers(game.players);

    // if multiplayer, game ends when one player remains
    if (count === 1 && game.isMultiplayer)
        return {endOfGame: true, winner :lastSocketId}

    // if solo player, game end when he looses
    if (count === 0)
        return {endOfGame: true, winner :null}

    return {endOfGame: false, winner :null}
}


function getPlayer(socketId: string, game: Game): Player | null {
    for (const thisPlayer of game.players) {
        if (thisPlayer.socketId === socketId) {
            return thisPlayer;
        }
    }
    return null;
}

function isMultiplayer(game:Game){
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

    socket.on('spectrum', (data: { socketId: string, spectrum: number[] }) => {
        let gameRoom: Game | undefined;
        for (const [roomName, game] of games.entries()) {
            if (game.players.some(p => p.socketId === socket.id)) {
                gameRoom = game;
                break;
            }
        }

        if (!gameRoom) return;

        const player = getPlayer(data.socketId, gameRoom);
        if (!player) return;

        player.spectrum = data.spectrum;

        // Envoie UNIQUEMENT au joueur qui a émis, pas à toute la room
        const allSpectrums = gameRoom.getAllSpectrums(socket.id);
        socket.emit('spectrum', allSpectrums);
    });

    socket.on('spectrumUpdate', (data: { socketId: string, changes: number[] }) => {
        let gameRoom: Game | undefined;
        for (const [roomName, game] of games.entries()) {
            if (game.players.some(p => p.socketId === socket.id)) {
                gameRoom = game;
                break;
            }
        }

        if (!gameRoom) return;

        // Mettre à jour le spectrum avec les changements
        const success = gameRoom.updatePlayerSpectrum(data.socketId, data.changes);
        if (!success) return;

        // Envoie UNIQUEMENT au joueur qui a émis, pas à toute la room
        const allSpectrums = gameRoom.getAllSpectrums(socket.id);
        socket.emit('spectrumUpdate', allSpectrums);
    });

    socket.on('playerLost', (room: string) => {
        const game = games.get(room);
        if (!game) return
        const player = getPlayer(socket.id, game)
        if (!player) return;
        player.isAlive = false

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

