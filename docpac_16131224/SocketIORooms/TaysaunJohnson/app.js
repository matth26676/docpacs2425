const express = require('express')
const app = express()
const jwt = require('jsonwebtoken');
const session = require('express-session');
const http = require('http').Server(app)
const io = require('socket.io')(http)

const AUTH_URL = 'https://formbar.yorktechapps.com/oauth';
const THIS_URL = 'http://localhost:3000/login'; 

app.use(session({
    secret: 'make up a secret string here but never publish it!',
    resave: false,
    saveUninitialized: false
}))

app.get('/login', (req, res) => {
    if (req.query.token) {
         let tokenData = jwt.decode(req.query.token);
         req.session.token = tokenData;
         req.session.user = tokenData.username;
         res.redirect('/');
    } else {
         res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.get('/', isAuthenticated, (req, res) => {
    try {
         res.render('index.ejs', {user : req.session.user})
    }
    catch (error) {
         res.send(error.message)
    }
});

var names = {}

io.on('connection', (socket) => {
    console.log('connection')
    socket.join('General')
    socket.on('newChatter', (name) => {
        names[socket.id] = name
    })
    console.log(socket.rooms)
    socket.on('message', (text, room, user) => {
        io.to(room).emit('text', text, user, room)
    })

    socket.on('namesMessage', (names) => {
        io.to(socket.id).emit('text', names)
    })

    socket.on('joinRoom', (room) => {

        socket.join(room)
        var rooms = []
        socket.rooms.forEach(room => {
            if (room != socket.id) {
                rooms.push(room)
            }
        });
        console.log(rooms)
        io.to(socket.id).emit('roomList', rooms)
    })

    socket.on('leaveRoom', (room) => {
        socket.leave(room)
        var rooms = []
        socket.rooms.forEach(room => {
            if (room != socket.id) {
                rooms.push(room)
            }
        });
        io.to(socket.id).emit('roomList', rooms)
    })
    
    socket.on('printUsers', (room) => {
        var roomNames = []
        io.sockets.adapter.rooms.get(room).forEach(user => {
            roomNames.push(names[user])
        })
        // console.log(roomNames)
        io.to(socket.id).emit('nameList', roomNames)
    })
})

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

http.listen(3000, (err) => {
    if(err) {
        console.log(err)
    } else {
        console.log('server running on port 3000')
    }
})