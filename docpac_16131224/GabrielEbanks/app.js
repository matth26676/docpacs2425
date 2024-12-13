const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const session = require('express-session');
const sqlite3 = require('sqlite3');
const socketIo = require('socket.io');
const PORT = 3000;

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
    res.render('index', { user: req.session.user,});
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

app.get('index', isAuthenticated, (req, res) =>
    res.render('index', { user: req.session.user })
);

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



const io = socketIo(server);
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.join('general');
    console.log('joined general');
    var room = socket.rooms;
    console.log(room);

    socket.on('joinRoom', (user,arg) => {
        socket.join(arg);
        console.log(`username is: ${user},${arg}`);
        console.log(`Rooms for socket ${socket.id}:`, Array.from(socket.rooms));
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('userList', () => {
        console.log('Client requested user list');
    });

    socket.on('message', (message) => {
        console.log('message: received');
        io.to("general").emit('message', message);
    });

    socket.on('leave', (arg) => {
        socket.leave(arg);
        console.log(`Rooms for socket ${socket.id}:`, Array.from(socket.rooms));

});
});

