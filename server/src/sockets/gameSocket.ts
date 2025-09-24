import {Server, Socket} from "socket.io";
import Game from "../classes/Game.js";
import Piece from "../classes/Piece.js";


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

export function handleGame(
    socket: Socket,
    games: Map<string, Game>,
    io: Server) {
    socket.on('startGame', (room: string) => {
        const game = games.get(room);
        console.log("handles game = ", game);
        if (game) {
            game.started = true;
            io.to(room).emit("gameStarts");
        }
        console.log("handles game then = ", game);
    })

    socket.on('pieces', (room: string, count: number = 7) => {
        const game = games.get(room);
        if (!game) return;

        // Ensure the pieceQueue exists
        if (!Array.isArray((game as any).pieceQueue)) {
            (game as any).pieceQueue = [];
        }

        // Fill queue until it has at least `count` pieces.
        // Prefer using game.generateNextPiece() if available, otherwise create Piece directly.
        while ((game as any).pieceQueue.length < count) {
            if (typeof (game as any).generateNextPiece === 'function') {
                (game as any).generateNextPiece();
            } else {
                (game as any).pieceQueue.push(new Piece());
            }
        }

        // Extract `count` pieces and send their types to the requesting socket
        const piecesToSend: string[] = [];
        for (let i = 0; i < count; i++) {
            const p = (game as any).pieceQueue.shift();
            if (p) {
                piecesToSend.push(p.type);
            }
        }

        socket.emit("pieces", piecesToSend);
    });

}

