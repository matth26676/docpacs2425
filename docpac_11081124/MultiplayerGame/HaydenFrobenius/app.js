const express = require('express');
const app = express();
const path = require('path');
let serv = require('http').Server(app);
const crypto = require('crypto');

function generateKey() {
  return crypto.randomBytes(2).toString('hex').slice(0, 4);
}
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/public', express.static(path.join(__dirname, 'public')));
serv.listen(PORT);

const ROWS = 6;
const COLS = 7;

let games = new Map();

function randomHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

let io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    io.emit('playerConnected', {id: socket.id});

    socket.on('disconnect', function(){
        io.emit('playerDisconnected', {id: socket.id});
    });

});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/joingame', (req, res) => {
    res.render('joingame');
});

app.get('/creategame', (req, res) => {
    let gameCode = generateKey();
    let game = {
        code: gameCode,
        player1: null,
        player2: null,
        board: new Array(ROWS).fill(0).map(() => new Array(COLS).fill(0)),
        turn: 1,
    };
});