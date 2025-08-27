import {createServer} from "node:http";
import app from "./app.js";
import {initSocket} from "./socket.js";

const PORT = 3000;

const server = createServer(app);

initSocket(server);

server.listen(PORT, () => {
    console.log(`Port = ${PORT}`);
});