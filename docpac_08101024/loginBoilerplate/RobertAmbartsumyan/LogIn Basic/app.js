const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const path = require('path');

const PORT = 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'LookAtMeImTheSecretNow',
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.error('Database opening error: ', err);
    } else {
        console.log('Database opened');
    }
});

app.get('/', (poo, pee) => {
    pee.render('index');
});

app.get('/login', (poo, pee) => {
    pee.render('login');
});

app.post('/login', (req, res) => {
    if (req.body.username && req.body.password) {
        db.get(`SELECT * FROM users WHERE username = ?; `, req.body.username, (err, row) => {
            if (err) {
                res.send('An error occurred:\n' + err);
            } else if (!row) {
                //Create a new salt for this user
                const SALT = crypto.randomBytes(16).toString('hex');

                //Use salt to 'hash' password
                crypto.pbkdf2(req.body.password, SALT, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('An error occurred:\n' + err);
                    } else {
                        const hashPassword = derivedKey.toString('hex');
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.username, hashPassword, SALT], (err) => {
                            if (err) {
                                res.send('An error occurred:\n' + err);
                            } else {
                                res.send('new user created');
                            }
                        });
                    }
                });

            } else {
                //Compare your password with provided password
        
                crypto.pbkdf2(req.body.password, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('An error occurred:\n' + err);
                    } else {
                        const hashPassword = derivedKey.toString('hex');

                        if (hashPassword === row.password) {
                            req.session.user = req.body.username;

                            res.redirect('/home');
                        } else {
                            res.send('Invalid username or password');
                        }
                    }
                });
            }
        });
    } else {
        res.send('Invalid username or password');
    }
});

app.get('/home', isAuthenticated, (req, res) => {
    res.render('home');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});