const express = require('express');
const session = require('express-session');
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);

const port = 3000;

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const routes = require('./modules/routes');
const socketHandler = require('./modules/socket');

const sessionMiddleware = session({
    store: new SQLiteStore(),
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
});

app.set('view engine', 'ejs');

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware);
io.use((socket, next) => { sessionMiddleware(socket.request, {}, next); });

io.on('connection', (socket) => {
    socketHandler.connection(io, socket);
});

app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', routes.loginPost);
app.get('/logout', routes.logout);
app.get('/chat', routes.isAuthenticated, routes.chat);

http.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});