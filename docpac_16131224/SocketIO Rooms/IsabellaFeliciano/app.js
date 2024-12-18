// importing required modules
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });

// setting up view engine
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// setting up routes
app.get('/', (req, res) => {
    res.render('login');
});

// chat route
app.get('/index', (req, res) => {
    if (req.query.name) {
        res.render('index', { user: req.query.name })
    } else (
        res.redirect('/')
    )
});

const users = {};

// WebSocket connection
io.on('connection', (socket) => {
    console.log('User connected');
    console.log(socket.rooms)
    socket.join('general');
    socket.currentRoom = 'general';

    socket.on('message', (message) => {
        console.log(message);
        io.to(socket.currentRoom).emit('send message', socket.currentRoom + ": " + message);
    });

    socket.on('joinRoom', (data) => {
        users[socket.id] = data.user;
        socket.join(data.room);
        socket.currentRoom = data.room;
        io.to(socket.id).emit('roomList', [...socket.rooms]);
    })

    socket.on('leaveRoom', (data) => {
        socket.leave(data.room);
        users[socket.id] = data.user;
        io.to(socket.id).emit('roomList', [...socket.rooms]);
    })
});