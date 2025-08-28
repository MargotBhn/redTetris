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
    console.log("server update game");
    io.to(game.roomName).emit("newLeader", socketId);
}

export function handleGame(
    socket: Socket,
    games: Map<string, Game>,
    io: Server) {
    console.log("handle game", socket.id, games, io);
}