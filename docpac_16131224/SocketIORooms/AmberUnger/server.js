const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const sharedSession = require('express-socket.io-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing requests and managing sessions
const sessionMiddleware = session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Serve static files (e.g., frontend HTML/JS/CSS)
app.use(express.static('public'));

// Login route (custom login for simplicity)
app.post('/', (req, res) => {
    req.session.username = req.body.username;
    res.redirect('/chat');
});

// Redirect to login if not logged in
app.use('/chat', (req, res, next) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    next();
});

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Serve the main chat page
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});

const server = http.createServer(app);
const io = socketIo(server);

// Use shared session middleware for socket.io
io.use(sharedSession(sessionMiddleware, {
    autoSave: true
}));

const users = {}; // {socketId: {username, rooms: []}}
const activeRooms = new Set(['home']); // Track active rooms, always include 'home'

io.on('connection', (socket) => {
    const session = socket.handshake.session;
    if (!session || !session.username) {
        socket.disconnect();
        return;
    }

    const username = session.username;
    users[socket.id] = { username, rooms: ['home'] };

    socket.join('home');
    sendRoomList();

    console.log(`${username} connected and joined home`);

    // Emit a message to the home room that the user has joined
    io.to('home').emit('message', { user: 'Server', time: new Date(), room: 'home', msg: `${username} joined the chat` });

    socket.on('message', (data) => {
        const { room, msg } = data;
        if (msg.startsWith('/')) {
            handleSlashCommand(socket, msg);
        } else {
            io.to(room).emit('message', { user: username, time: new Date(), room, msg });
        }
    });

    socket.on('disconnect', () => {
        const userRooms = users[socket.id].rooms;
        delete users[socket.id];
        userRooms.forEach(room => {
            if (room !== 'home' && !Object.values(users).some(user => user.rooms.includes(room))) {
                activeRooms.delete(room);
            }
        });
        sendRoomList();
        console.log(`${username} disconnected`);
    });
});

function handleSlashCommand(socket, msg) {
    const args = msg.slice(1).split(' ');
    const command = args[0];
    const roomName = args[1];
    const user = users[socket.id];

    if (command === 'join' && roomName) {
        if (user.rooms.includes(roomName)) {
            // Leave the room
            socket.leave(roomName);
            user.rooms = user.rooms.filter(r => r !== roomName);
            if (roomName !== 'home' && !Object.values(users).some(user => user.rooms.includes(roomName))) {
                activeRooms.delete(roomName);
            }
            io.to(roomName).emit('message', { user: 'Server', time: new Date(), room: roomName, msg: `${user.username} left ${roomName}` });
        } else {
            // Join the room
            socket.join(roomName);
            user.rooms.push(roomName);
            activeRooms.add(roomName);
            io.to(roomName).emit('message', { user: 'Server', time: new Date(), room: roomName, msg: `${user.username} joined ${roomName}` });
        }
        sendRoomList();
        socket.emit('joinRoom', roomName); // Notify client to clear chat

        // Rejoin the home room if no other rooms are joined
        if (user.rooms.length === 0) {
            user.rooms.push('home');
            socket.join('home');
            io.to('home').emit('message', { user: 'Server', time: new Date(), room: 'home', msg: `${user.username} rejoined home` });
            socket.emit('joinRoom', 'home'); // Notify client to clear chat
        }
    } else if (command === 'users') {
        const room = user.rooms[0]; // Current room
        const roomUsers = Object.values(users).filter(u => u.rooms.includes(room));
        socket.emit('message', { user: 'Server', time: new Date(), room, msg: `Users in ${room}: ${roomUsers.map(u => u.username).join(', ')}` });
    }
}

function sendRoomList() {
    io.emit('roomsList', Array.from(activeRooms));
}

const localMachineIP = '172.16.3.122';
server.listen(3000, localMachineIP, () => {
    console.log(`Server is running on http://${localMachineIP}:3000`);
});