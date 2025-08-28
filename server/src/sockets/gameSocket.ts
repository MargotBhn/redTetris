import {Server, Socket} from "socket.io";
import Game from "../classes/Game.js";


export function sendListPlayers(
    game: Game,
    io: Server,
) {
    const players = game.players.map(player => player.name);
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

}

