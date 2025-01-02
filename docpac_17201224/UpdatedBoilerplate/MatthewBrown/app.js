const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const routes = require('./modules/routes.js');
const socketHandlers = require('./modules/socket.js');

const AUTH_URL = 'http://172.16.3.212:420/oauth'; // address to the instance of fbjs to connect to
const THIS_URL = 'http://localhost:3000/login'; // the address to your application

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

app.get('/profile', (req, res) => {
    if (req.session.user === undefined) {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    } else {
        res.render('profile.ejs', { fb_name: req.session.user, fb_id: req.session.uid });
    }
});

app.post('/profile', (req, res) => {
    var checked = req.body.check;

    console.log(checked);
    if (checked === 'on') {
        checked = true;
    } else {
        checked = false;
    }

    db.get(`SELECT fb_id, profile_checked FROM users`, (err, row) => {
        if (err) {
            res.send("There was an error:\n" + err);
        } else {
            let uid = row.fb_id;
            console.log(uid);
            uid = parseInt(uid);
            console.log(uid);
            db.run(`UPDATE users SET profile_checked=? WHERE fb_id=?`, [checked, uid], (err) => {
                if (err) {
                    res.send('Database error:\n' + err);
                } else {
                    db.get(`SELECT profile_checked FROM users`, (err, row) => {
                        console.log(row.profile_checked + ": This is a check");
                    });
                }
            });
        }
    });
    console.log(checked + ": End of function");
    res.render("profile", { fb_name: req.session.user, fb_id: req.session.uid });
});

app.get('/oauth', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        req.session.uid = tokenData.id;
        req.session.logIn = tokenData.loggedIn;
        console.log(tokenData);
        console.log(tokenData.username);
        console.log(tokenData.id);
        console.log(req.session.uid);

        db.get(`SELECT fb_name, fb_id, profile_checked FROM users WHERE fb_id = ?`, [req.session.uid], (err, row) => {
            if (err) {
                res.send("There was an error:\n" + err);
            } else if (!row) {
                db.run(`INSERT INTO users (fb_name, fb_id, profile_checked) VALUES (?, ?, ?);`, [req.session.user, req.session.uid, null], (err) => {
                    if (err) {
                        res.send('Database error:\n' + err);
                    }
                });
            }
        });
        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    }
});

io.on('connection', (socket) => socketHandlers.connection(io, socket));