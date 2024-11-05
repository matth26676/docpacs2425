const express = require('express');
const app = express();
const path = require('path');
let serv = require('http').Server(app);
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/public', express.static(path.join(__dirname, 'public')));
serv.listen(PORT);

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
    res.render('game');
});