const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const crypto = require('crypto')


const port = 3000;
const server = createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));


function generateKey() {
    return crypto.randomBytes(2).toString('hex').slice(0, 4);
}

let games = new Map();

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    let gameCode = req.query.gameCode.toLowerCase();

    if(!games.has(gameCode)){
        res.send('Game not found');
        return;
    }

    res.render('game', {gameCode : gameCode});
});

app.get('/create', (req, res) => {
    let gameCode = generateKey();

    while(games.has(gameCode)){ 
        gameCode = generateKey();
    }

    games.set(gameCode);

    res.redirect('/game?gameCode=' + gameCode);
});

app.get('/join', (req, res) => {
    res.render('join');
});


io.on('connection', (socket) => {
    console.log("CONNECTION!");
    socket.on('disconnect', () => {
        console.log("BYE BYE!");
    });
});



server.listen(port, () => {
    console.log(`http://localhost:${port}`)
})