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
app.use('/shared', express.static(path.join(__dirname, 'shared')))
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
        let myTurn;

        if(game.player1 === null){

            game.player1 = socket.id;
            myTurn = 1;
            socket.join(gameCode);

        } else if(game.player2 === null){

            game.player2 = socket.id;
            myTurn = 2;
            socket.join(gameCode);

            io.to(gameCode).emit('newTurn', {turn: 1});
            io.to(gameCode).emit('startGame', {board: game.board.board});

        } else {

            return; //don't worry about it

        }

        game.board = new Board(ROWS, COLS);
        let board = game.board.board;

        socket.emit('init', {board: board, myTurn: myTurn});

        console.log(socket.id + ' connected to game ' + gameCode);

    });

    socket.on('ghostPieceMove', function(data){
        let gameCode = data.gameCode;
        //console.log(`move ghost piece to col: ${data.col}`)
        io.to(gameCode).emit('moveGhostPiece', {col: data.col});
    });

    socket.on('pieceDrop', function(data){
        let gameCode = data.gameCode;
        let game = games.get(gameCode);
        let board = game.board;

        let col = data.col;
        let row = board.getLowestAvailableRow(col);
        let turn = data.turn;

        console.log(`piece dropped at col: ${col}, row: ${row}, turn: ${turn}`);

        //just some guard clauses

        //not your turn
        if(game.turn !== data.turn){
            console.log('not your turn');
            return;
        }

        //space isn't empty
        if(board.getCell(data.col, 0) !== 0){
            console.log('space not empty');
            return;
        }

        //position is out of bounds
        if(col < 0 || col >= COLS || row < 0 || row >= ROWS){
            console.log('position out of bounds');
            return;
        }

        board.dropPiece(col, row, turn);

        io.to(gameCode).emit('updateBoard', {newBoard: board.board});

        if(board.checkFull()){
            io.to(gameCode).emit('gameEnd', {winner: null});
            return;
        }

        game.turn = (game.turn === 1) ? 2 : 1;

        let winner = board.checkWin();
        
        if (winner) {
            io.to(gameCode).emit('gameEnd', {winner: winner});
        } else {
            io.to(gameCode).emit('newTurn', {turn: game.turn});
        }

    });

    socket.on('disconnect', function(){
        let gamesArray = Array.from(games);
        let index = gamesArray.findIndex(([gameCode, game]) => game.player1 === socket.id || game.player2 === socket.id);

        if(index === -1){
            return; //don't worry about it
        }

        let gameCode = gamesArray[index][0];
        let game = games.get(gameCode);

        game.board = new Board(ROWS, COLS);
        game.turn = 1;

        if (game.player1 === socket.id) {

            io.to(gameCode).emit('hostDisconnected');
            game.player1 = game.player2; // player2 becomes host if host leaves
            game.player2 = null;

        } else if(game.player2 === socket.id){

            io.to(gameCode).emit('opponentDisconnected');
            game.player2 = null;

        }

        if(!game.player1 && !game.player2){
            games.delete(gameCode);
        }

        io.to(game.player1).emit('init', {board: game.board.board, myTurn: game.turn});

        console.log(socket.id + ' disconnected from game ' + gameCode);

    });

});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/joingame', (req, res) => {
    res.render('joingame');
});

app.get('/game', (req, res) => {
    let gameCode = req.query.gameCode.toLowerCase();

    if(!games.has(gameCode)){
        res.send('Game not found');
        return;
    }

    let game = games.get(gameCode);

    //this causes a bug where the websocket doesn't clear the player before this check happens
    //so if you refresh your page in the middle of a game, it will say the game is full
    //I figured it was more important to be able to refresh your page so I commented it out.

    /*if(game.player1 && game.player2){
        res.send('Game Full');
        return;
    }*/

    res.render('game', {gameCode : gameCode});
});

app.get('/creategame', (req, res) => {
    let gameCode = generateKey();

    // make sure key is unique
    while(games.has(gameCode)){ 
        gameCode = generateKey();
    }

    let game = {
        player1: null,
        player2: null,
        board: new Board(ROWS, COLS),
        turn: 1,
    };

    games.set(gameCode, game);

    res.redirect('/game?gameCode=' + gameCode);
});