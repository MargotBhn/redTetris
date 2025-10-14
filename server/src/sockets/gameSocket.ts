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
    return game.players.length > 1; // FIX: était !== 0, mais 1 joueur = solo
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
        if (!game) return;

        game.started = true;
        game.isMultiplayer = isMultiplayer(game);

        // ✅ FIX: Envoyer le premier sac à CHAQUE joueur individuellement
        for (const player of game.players) {
            const pieceBag = game.getPieceBag(player.getBagIndex());
            player.incrementBagIndex();
            io.to(player.socketId).emit("pieceBag", pieceBag);
        }

        // Ensuite, signaler que le jeu commence
        io.to(room).emit("gameStarts");
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

        // Envoyer les spectrums mis à jour à TOUS les joueurs de la room
        const allSpectrums = gameRoom.getAllSpectrums();
        io.to(gameRoom.roomName).emit('spectrum', allSpectrums);
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

        // Envoyer les spectrums mis à jour à TOUS les joueurs de la room
        const allSpectrums = gameRoom.getAllSpectrums();
        io.to(gameRoom.roomName).emit('spectrumUpdate', allSpectrums);
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