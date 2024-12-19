const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const routes = require('./modules/routes.js');
const socketHandlers = require('./modules/socket.js');

const app = express();
const port = 3000;

const db = new sqlite3.Database('./data/database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
});

const io = require('socket.io')(server);

const sessionMiddleware = session({
    store: new SQLiteStore({ db: 'sessions.db' }),
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(sessionMiddleware);

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.get('/', routes.root);
app.get('/login', routes.loginGet);
app.post('/login', (req, res) => routes.loginPost(req, res, db));
app.get('/logout', routes.logout);
app.get('/chat', routes.isAuthenticated, routes.chat);

io.on('connection', (socket) => socketHandlers.connection(io, socket));