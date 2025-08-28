import {createServer} from 'node:http';
import {initSocket} from '../sockets/initSocket';
import {io as Client, Socket} from 'socket.io-client';

let httpServer: ReturnType<typeof createServer>;
let clientSocket: Socket;

beforeAll((done) => {
    httpServer = createServer();
    initSocket(httpServer);
    httpServer.listen(() => {
        const port = (httpServer.address() as any).port;
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket.on('connection', done);
    });
});

afterAll(() => {
    if (clientSocket.connected) clientSocket.close();
    httpServer.close();
});

test('should receive testMessage from server', (done) => {
    clientSocket.on('testMessage', (msg: any) => {
        try {
            expect(msg).toBe('test message depuis le server');
            done();
        } catch (err) {
            done(err);
        }
    });
});