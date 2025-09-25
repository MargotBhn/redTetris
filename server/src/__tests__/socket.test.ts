import {createServer} from 'node:http';
import {initSocket} from '../sockets/initSocket';
import {io as Client, Socket} from 'socket.io-client';
// import {handlePlayerConnection} from "../sockets/connectionsSocket";


let httpServer: ReturnType<typeof createServer>;
let clientSocket: Socket;

beforeAll((done) => {
    httpServer = createServer();
    initSocket(httpServer);
    httpServer.listen(() => {
        const port = (httpServer.address() as any).port;
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket.on('connect', done);
    });
});

afterAll(() => {
    if (clientSocket.connected) clientSocket.close();
    httpServer.close();
});

test('should join room successfully', (done) => {
    clientSocket.on('joinedSuccess', (isLeader: boolean) => {
        try {
            expect(isLeader).toBe(true); // First player should be leader
            done();
        } catch (err) {
            done(err);
        }
    });

    // Emit joinRoom event to trigger the response
    clientSocket.emit('joinRoom', '1', 'testPlayer', clientSocket.id);
});