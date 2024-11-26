const express = require('express');
const app = express();
const path = require('path');
const { join } = require('path');
const sql = require('sqlite3');
const session = require('express-session');
const crypto = require('crypto');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server);

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'LookAtMeImTheSecretNow',
    resave: false,
    saveUninitialized: false
}));

function isAuthed(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

app.get('/', isAuthed, (req, res) => {
    res.render(join('index'));
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    if (req.body.username && req.body.password) {
        db.get('SELECT * FROM users WHERE username = ?; ', req.body.username, (err, row) => {
            if (err) res.render('/login', { message: 'An error occured' });
            else if (!row) {
                const SALT = crypto.randomBytes(16).toString('hex');
                crypto.pbkdf2(req.body.password, SALT, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) res.redirect('/login');
                    else {
                        const hashPassword = derivedKey.toString('hex');
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.username, hashPassword, SALT], (err) => {
                            if (err) res.send('An error occured:\n' + err);
                            else {
                                res.redirect('/login');
                            };
                        });
                    }
                });
            } else {
                crypto.pbkdf2(req.body.password, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) res.redirect('/login');
                    else {
                        const hashPassword = derivedKey.toString('hex');
                        if (hashPassword === row.password) {
                            req.session.user = req.body.username;
                            res.redirect('/');
                        } else res.redirect('/login');
                    }
                });
            }
        });
    }
});

//db for data storage
const db = new sql.Database('data/data.db', (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Opened database');
    }
});

//START SERVER CODE HERE

//END SERVER CODE HERE

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});