import {Server as HTTPServer} from 'node:http'
import {Server} from 'socket.io'



let io : Server

export function initSocket(server: HTTPServer) {
    console.log('init socket server')

    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        }
    })

    io.on('connection', (socket) => {
        console.log("Socket connected", socket.id);
    })

}