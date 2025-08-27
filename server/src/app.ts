import express from "express"
import cors from "cors"

const app = express()

app.use(cors());
app.use(express.json());

app.get("/test", (_req, res) => {
    res.send("test recu");
})

export default app