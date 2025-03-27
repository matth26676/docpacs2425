const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io')
const crypto = require('crypto');

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = 3000;

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.use(express.urlencoded({extended: true}));

io.on('connection', (socket) => {
    console.log("CONNECTION!");
    socket.on('disconnect', () => {
        console.log("BYE BYE!");
    })
})

app.get('/', (req, res) => {
    res.render('index')
});

app.get('/game', (req, res) => {
    res.render('game')
})

app.get('/join', (req, res) => {
    res.render('join')
})

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})

let games = new Map();

function generateKey() {
    return crypto.randomBytes(2).toString('hex').slice(0, 4);
}

app.get('/creategame', (req, res) => {
    let gameCode = generateKey();

    // make sure key is unique
    while (games.has(gameCode)) {
        gameCode = generateKey();
    }

    let game = {
        player1: null,
        player2: null,
    };

    games.set(gameCode, game);

    res.redirect('/game?gameCode=' + gameCode);
});