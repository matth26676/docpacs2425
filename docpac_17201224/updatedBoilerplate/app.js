const express = require('express');
const app = express(); 
const routes = require('./modules/routes.js');
const socket = require('./modules/socket.js');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const socketIo = require('socket.io');
PORT = 3000;
path = require('path');

const sessionMiddleware = session({
    store: new SQLiteStore,
    secret: 'skibidiragatheoppstoppa',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
});
app.use(sessionMiddleware);
const server = app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);});
const io = socketIo(server);
io.use((socket, next) => { sessionMiddleware(socket.socketHandler, {}, next); });


app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.get('/', routes.index);

app.get('/login', routes.login);

app.post('/login', routes.loginPost);

app.get('/logout', routes.logout);

app.get('/chat', routes.chat);