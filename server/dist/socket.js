import { Server as HTTPServer } from 'node:http';
import { Server } from 'socket.io';
let io;
export function initSocket(server) {
    console.log('init socket server');
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        }
    });
    io.on('connection', (socket) => {
        console.log("Socket connected", socket.id);
        const message = "test message depuis le server";
        io.emit('testMessage', message);
    });
    io.on('disconnect', (socket) => {
        console.log("Socket disconnected ", socket.id);
    });
}
//# sourceMappingURL=socket.js.map