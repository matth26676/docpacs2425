const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const session = require('express-session');
const sqlite3 = require('sqlite3');
const socketIo = require('socket.io');
const PORT = 3000;
users = new Set();
const roomUsers = {};


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const FBJS_URL = 'https://formbar.yorktechapps.com';
const THIS_URL = 'http://localhost:3000/login';
const API_KEY = 'bd4cf1e837768719675cf8bfa360a3e60348af7898a0b61d385a560323423204a9445d4d25bedc5ec4b34626b89598474e45152a9f4ce523d444b0887cf90ed4';

app.use(session({
    secret: 'ohnose!',
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect(`/login?redirectURL=${THIS_URL}`);
}

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user, });
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        console.log(req.session.user);
        res.redirect('/');
    } else {
        res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/', isAuthenticated, (req, res) => {
    console.log('Session user:', req.session.user);
    res.render('index', { user: req.session.user });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



const io = socketIo(server);
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.join('general');
    console.log('joined general');
    users.add(socket.id);


    var room = socket.rooms;

    console.log(room);

    socket.on('useForRooms', () => {
        const rooms = Array.from(socket.rooms);
        socket.emit('userList', {
            rooms: rooms
        });
    });

    socket.on('joinRoom', (data) => {
        const user = data.user;
        const arg = data.arg;
        socket.join(arg);
        currentRoom = arg;

        if (!roomUsers[arg]) {
            roomUsers[arg] = new Set();
        }

        roomUsers[arg].add(user);
        console.log(`username is: ${user}, and they are joining ${arg}`);
        console.log(`Rooms for socket ${socket.id}:`, Array.from(socket.rooms));
        
        const currentRooms = Array.from(socket.rooms); 
        socket.emit('roomListUpdate', {
            message: `You joined room: ${arg}. Your current rooms: ${currentRooms.join(', ')}`,
            rooms: currentRooms
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        users.delete(socket.id);
    });

    socket.on('userList', (data) => {
        console.log('Client requested user list');
        const roomUsers = Array.from(users);
        io.to(data.room).emit('userList', roomUsers);
    });

    socket.on('message', (data) => {
        console.log(data);
        const room = data.room;
        const message = data.message
        const user = data.user;
        console.log(room, message, user);
        console.log('message: received in room', room);
        io.to(room).emit('message', user, message,);
    });

    socket.on('leave', (data) => {
        const arg = data.arg;
        socket.leave(arg);
        console.log(`User left room: ${arg}`);
        const currentRooms = Array.from(socket.rooms);
        socket.emit('roomListUpdate', {
            message: `Your current rooms: ${currentRooms}`,
            rooms: currentRooms
        });
    });
});

