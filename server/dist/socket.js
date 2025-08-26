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
    });
}
//# sourceMappingURL=socket.js.map