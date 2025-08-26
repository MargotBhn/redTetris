import express from 'express';
import cors from "cors";
const app = express();
const PORT = 3000;
app.use(cors());
app.get('/test', (req, res) => {
    res.send('test recu');
});
app.listen(PORT, () => {
    console.log(`Port = ${PORT}`);
});
//# sourceMappingURL=index.js.map