const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io')

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = 3000;

app.set('view engine', 'ejs')

app.use(express.static('public'))

let games = new Map()


io.on('connection', (socket) =>{
    console.log("CONNECTION!");
    socket.on('playerConnect',()=>{
        let code = data.code;
        let game = game.get(code)
        console.log("player connected")
    })
    socket.on('disconnect', ()=>{
        console.log("BYE BYE!");
    })
})




app.get('/', (req, res) => {
    res.render('index')
});

app.get('/game', (req, res) => {
    res.render('game')
});

app.get('/lore', (req, res) => {
    res.render('lore')
});

app.get('/multiplayer', (req, res) => {
    res.render('multiplayer');
});

app.get('/game_hard', (req, res) => {
    res.render('game_hard')
});

app.get('/no_pass', (req, res) => {
    res.render('no_pass');
});

server.listen(port, () => {
    console.log(`server started on http://localhost:${port}`)
})