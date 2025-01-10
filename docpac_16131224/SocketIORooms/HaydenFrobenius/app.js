const { name } = require('ejs');
const jwt = require('jsonwebtoken');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { addParamsToURL } = require('./util');

const app = express();
const PORT = 3000;
//const THIS_URL = 'http://172.16.3.136:' + PORT;
const THIS_URL = 'http://localhost:' + PORT;
//const FB_URL = 'http://172.16.3.100:420';
const FB_URL = 'https://formbar.yorktechapps.com';
const AUTH_URL = FB_URL + '/oauth';
const SECRET = "guh";

const http = require('http').Server(app);
const io = require('socket.io')(http);

const commands = require('./commands').commandMap;

let sessionMiddleware = session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false
});

let chats = new Set();

app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function isLoggedIn(req, res, next) {
    if(req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

http.listen(PORT, () => {
    console.log(`Server is running on ${THIS_URL}`);
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
    console.log('User Connected');
    socket.user = socket.request.session.user;

    socket.join('general');
    socket.currentRoom = 'general';

    let roomsList = Array.from(socket.rooms).filter(room => room !== socket.id);
    socket.emit('update rooms list',{newList: roomsList});
    socket.emit('update current room', {currentRoom: socket.currentRoom});

    socket.on('goto room', (data) => {
        const roomName = data.roomName;
        socket.currentRoom = roomName;
        socket.emit('update current room', {currentRoom: socket.currentRoom});
    });

    socket.on('get rooms', () => {
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        socket.emit('update rooms list', {newList: rooms});
    });

    socket.on('chat message', (data) => {
        const message = data.text;
        const sender = data.sender;

        if(message[0] == '/'){

            const tokens = message.replace('/', '').split(' ');
            const command = tokens[0];
            const args = tokens.slice(1);

            let output = "";

            if(commands.has(command)){

                const commandFunction = commands.get(command);
                let result = commandFunction(args, io, socket);

                if(result){
                    output = result;
                }

            } else {
                output = "Invalid Command";
            }


            socket.emit('chat message', { message, sender, timestamp: new Date().toISOString(), room: socket.currentRoom});
            if(output) socket.emit('chat message', { message: output, timestamp: new Date().toISOString(), sender: { username: 'Server' }, room: socket.currentRoom });

        } else {
            io.to(socket.currentRoom).emit('chat message', { message, sender, timestamp: new Date().toISOString(), room: socket.currentRoom});
        }

    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

app.get('/login', async (req, res) => {

    if (!req.query.token) {
        const redirectUrl = addParamsToURL(`${AUTH_URL}`, { redirectURL: `${THIS_URL}/login` });
        res.redirect(redirectUrl);
        return;
    }

    let tokenData = jwt.decode(req.query.token);
    req.session.user = tokenData;

    res.redirect('/');
});

app.get('/', isLoggedIn, (req, res) => {
    res.render('chat', { user: req.session.user });
});