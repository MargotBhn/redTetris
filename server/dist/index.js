import express from 'express';
import cors from "cors";
import { createServer } from "node:http";
import { initSocket } from "./socket.js";
const app = express();
const server = createServer(app);
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.get('/test', (req, res) => {
    res.send('test recu');
});
initSocket(server);
server.listen(PORT, () => {
    console.log(`Port = ${PORT}`);
});
//# sourceMappingURL=index.js.map