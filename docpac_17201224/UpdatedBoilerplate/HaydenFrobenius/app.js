const express = require('express');
const session = require('express-session');
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);

const dotenv = require('dotenv');

const config = dotenv.config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const routes = require('./modules/routes');
const socketHandler = require('./modules/socket');

const sessionStore = new SQLiteStore();

const sessionMiddleware = session({
    store: sessionStore,
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

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

io.on('connection', (socket) => {
    socketHandler.connection(io, socket);
});

app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', routes.loginPost);
app.get('/fblogin', routes.formbarLogin);
app.get('/logout', routes.logout);
app.get('/chat', routes.isAuthenticated, routes.chat);

http.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`Server is running on http://${process.env.HOST}:${process.env.PORT}`);
});