const express = require('express');
const jwt = require('jsonwebtoken')
const session = require('express-session');
const socketIo = require('socket.io');

const app = express();
const port = 3000;

const FBJS_URL = 'http://172.16.3.100:420'
var THIS_URL = ''

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else {
        THIS_URL = 'http://' + req.headers.host + req.url + 'login'
        res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`)
    }
}

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const io = socketIo(server);

app.set('view engine', 'ejs');

app.use(express.static('public'))

app.use(session({
    secret: 'SocketRooms',
    resave: false,
    saveUninitialized: false
}))

app.get('/', isAuthenticated, (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        console.log(tokenData)
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        req.session.userid = tokenData.id;

        
        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

io.on('connection', (socket) => {
    socket.join('general');
    socket.emit('roomsList', `${Array.from(socket.rooms).join(', ')}`);
    socket.on('message', (message) => {
        if (message.startsWith('/')) {
            // grabs the message and splits it into command and arguments
            let command = message.split(' ')[0].substring(1);
            let args = message.split(' ').slice(1);
            // compares the command to known commands
            switch (command) {
                case 'join':
                    socket.join(args[0]);
                    break;
                case 'leave':
                    socket.leave(args[0]);
                    break;
                case 'users':
                    let room = Array.from(socket.rooms)[1]; // The first room is the socket id, the second is the actual room
                    let users = [];
                    let clients = io.sockets.adapter.rooms.get(room);
                    if (clients) {
                        clients.forEach(clientId => {
                            let clientSocket = io.sockets.sockets.get(clientId);
                            users.push(clientSocket.id); // You can customize this to push any user information you have
                        });
                    }
                    socket.emit('message', `Users in ${room}: ${users.join(', ')}`);
                    break;
                default:
                    socket.emit('message', 'Unknown command');
                    break;
            }
        } else {
        
        }
    });
})
