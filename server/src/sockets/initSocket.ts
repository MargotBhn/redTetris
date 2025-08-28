import {Server as HTTPServer} from 'node:http'
import {Server} from 'socket.io'
import Game from "../classes/Game";
import {handlePlayerConnection} from "./connectionsSocket.js";
import {handleGame} from "./gameSocket.js";


export function initSocket(server: HTTPServer) {
    const games = new Map<string, Game>

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        }
    })

    io.on('connection', (socket) => {
        handlePlayerConnection(socket, games, io);
        handleGame(socket, games, io);
    })
}