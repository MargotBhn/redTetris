import {Server, Socket} from "socket.io";
import Game from "../classes/Game.js";

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

// Helper: chunk an array into bags of size 7
function chunkIntoBags<T>(arr: T[], size = 7): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        out.push(arr.slice(i, i + size));
    }
    return out;
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
    });

    // Serve shared piece types from the server's 7-bag sequence
    socket.on('pieces', (room: string, count: number = 7) => {
        const game = games.get(room);
        if (!game) return;

        const types: string[] =
            typeof (game as any).takeTypes === 'function'
                ? (game as any).takeTypes(count)
                : [];

        socket.emit("pieces", types);
    });

    // Expose current queue grouped as 7-piece bags (non-destructive)
    socket.on('pieces:queue', (room: string) => {
        const game = games.get(room);
        if (!game) return;

        const queue = Array.isArray((game as any).pieceQueue)
            ? ((game as any).pieceQueue as string[])
            : [];

        const bags = chunkIntoBags(queue, 7);
        socket.emit('pieces:queue', { bags, total: queue.length });
    });

}

