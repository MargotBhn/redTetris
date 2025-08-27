import {Server as HTTPServer} from 'node:http'
import {Server} from 'socket.io'


export function initSocket(server: HTTPServer) {
    console.log('init socket server')
    let io: Server
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        }
    })

    io.on('connection', (socket) => {
        console.log("Socket connected", socket.id);

        socket.on('joinRoom', (room: string, login: string) => {
            

        })


        const message: any = "test message depuis le server"
        socket.emit('testMessage', message)

        socket.on('disconnect', () => {
            console.log("Socket disconnected ", socket.id);
        })
    })
}