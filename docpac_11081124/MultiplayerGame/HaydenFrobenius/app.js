const express = require('express');
const app = express();
const path = require('path');
let serv = require('http').Server(app);
const crypto = require('crypto');
const Board = require('./board').Board;


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
    socket.on('playerConnected', function (data) {
        let gameCode = data.gameCode;
        let game = games.get(gameCode);

        if(game.player1 === null){

            game.player1 = socket.id;
            socket.join(gameCode);
            console.log('player1 connected to game ' + gameCode);

        } else {

            game.player2 = socket.id;
            socket.join(gameCode);
            io.to(game.player1).emit('opponentConnected');
            console.log('player2 connected to game ' + gameCode);
        }

    });

    socket.on('disconnect', function(){
        io.emit('playerDisconnected', {id: socket.id});
    });

});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    let gameCode = req.query.gameCode;

    if(!games.has(gameCode)){
        res.send('Game not found');
        return;
    }

    let game = games.get(gameCode);
    let board = game.board.board;
    let myTurn = game.player1 === null ? 1 : 2;

    res.render('game', {gameCode : gameCode, myTurn: myTurn, board: JSON.stringify(board)});
});

app.get('/creategame', (req, res) => {
    const gameCode = generateKey();
    let game = {
        player1: null,
        player2: null,
        board: new Board(ROWS, COLS),
        turn: 1,
    };

    games.set(gameCode, game);

    res.redirect('/game?gameCode=' + gameCode);
});