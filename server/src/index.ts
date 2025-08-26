import express from 'express'

const app = express();

const PORT = 3000

app.get('/test', (req, res) => {
    res.send('test recu')
})

app.listen(PORT, () => {
    console.log(`Port = ${PORT}`)
})