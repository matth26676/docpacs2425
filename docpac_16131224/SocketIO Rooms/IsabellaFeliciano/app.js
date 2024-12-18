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
    socket.on('message', (message) => {
        console.log(message);

        io.emit('send message', message);
    });

    socket.on('joinRoom', (data) => {
        socket.join(data.room);
        users[socket.id] = data.user;
        io.to(socket.id).emit('roomList', roomList);
    })
});