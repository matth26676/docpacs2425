const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('we good bruh');
    }
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'TotallyASecret',
    resave: false,
    saveUninitialized: false
}))

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        uid INTEGER NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        PRIMARY KEY(uid AUTOINCREMENT)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER NOT NULL UNIQUE,
        user TEXT NOT NULL,
        room TEXT NOT NULL,
        content TEXT NOT NULL,
        date TEXT NOT NULL,
        PRIMARY KEY(id AUTOINCREMENT)
    )`);
});

function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.post('/login', (req, res) => {
    if (req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("There was an error:\n" + err);
            } else if (!row) {
                //create a new salt
                const salt = crypto.randomBytes(16).toString("hex")

                //use the salt to 'hash' the password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('Error hashing password: \n' + err)
                    } else {
                        const hashPassword = derivedKey.toString('hex')

                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashPassword, salt], (err) => {
                            if (err) {
                                res.send('Database error:\n' + err)
                            } else {
                                res.send("Created new user")
                            }
                        })
                    }
                })


            }
            else if (row) {
                //compare storage password with provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('Error hashing password: \n' + err)
                    } else {
                        const hashPassword = derivedKey.toString('hex')

                        if (row.password === hashPassword) {
                            req.session.user = req.body.user;
                            res.redirect('/home')
                        } else {
                            res.send('Incorrect')
                        }
                    }
                })
            }
        })
    } else {
        res.send("You need a username and password");
    }
})


app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/', isAuthenticated, (req, res) => {
    res.render('index');
});

app.get('/rooms', isAuthenticated, (req, res) => {
    // Fetch the list of rooms the user has joined from the database
    db.all('SELECT DISTINCT room FROM messages WHERE user = ?', [req.session.user], (err, rows) => {
        if (err) {
            console.error('Error retrieving rooms:', err);
        } else {
            const rooms = rows.map(row => row.room);
            res.json(rooms);
        }
    });
});

function sendRoomList(socket) {
    const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
    socket.emit('roomsList', rooms);
}

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.join('default');
    socket.room = 'default';
    socket.emit('chat message', 'You joined the default room');
    sendRoomList(socket);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('join room', (room) => {
        if (socket.room) {
            socket.leave(socket.room);
        }
        socket.join(room);
        socket.room = room;
        socket.emit('chat message', `You joined room: ${room}`);
        sendRoomList(socket);

    });

    socket.on('chat message', (msg) => {
        if (msg.startsWith('/')) {
            const command = msg.split(' ')[0].slice(1);
            const args = msg.split(' ').slice(1);
            switch (command) {
                case 'join':
                    const room = args[0];
                    if (socket.room) {
                        socket.leave(socket.room);
                    }
                    socket.join(room);
                    socket.room = room;
                    socket.emit('chat message', `You joined room: ${room}`);
                    sendRoomList(socket);
                    break;

                case 'leave':
                    if (socket.room) {
                        socket.leave(socket.room);
                    }
                    socket.join('default');
                    socket.room = 'default';
                    socket.emit('chat message', 'You have left the room and joined the default room');
                    sendRoomList(socket);
                    break;
                case 'list':
                    const users = Array.from(io.sockets.adapter.rooms.get(socket.room) || []).map(socketId => {
                        return io.sockets.sockets.get(socketId).nickname || 'Anonymous';
                    });
                    socket.emit('chat message', `Users in room ${socket.room}: ${users.join(', ')}`);
                    break;
                default:
                    socket.emit('chat message', `Unknown command: ${command}`);
            }
        } else {
            if (!socket.room) {
                socket.room = 'default';
                socket.join('default');
            }
            const username = socket.request.session.user;
            const room = socket.room;
            const content = msg;
            const date = new Date().toISOString();

            db.run('INSERT INTO messages (user, room, content, date) VALUES (?, ?, ?, ?)', [username, room, content, date], (err) => {
                if (err) {
                    console.error('Error saving message:', err);
                }
            });

            io.to(socket.room).emit('chat message', `${username} [${date}]: ${msg}`);
        }
    });

});

server.listen(3000, () => {
    console.log('listening on port 3000');
})