const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();

const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'EebyDeebyRallaBabbaScoobyDoobyLalla',
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    console.log(req.body.user, req.body.pass);
    if (req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                return console.error(err);
            } else if (!row) {
                // Create a new salt for this user
                const salt = crypto.randomBytes(16).toString('hex');

                // Hash the password with the salt
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password: " + err.errno);
                    } else {
                        const hashedPass = derivedKey.toString('hex');
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPass, salt], (err) => {
                            if (err) {
                                return console.error(err);
                            } else {
                                console.log('User added');
                            }
                        });
                    }
                });

            } else {
                // Compare stored password with provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password: " + err.errno);
                    } else {
                        const hashedPass = derivedKey.toString('hex');

                        if (row.password === hashedPass) {
                            req.session.user = req.body.user;
                            res.redirect('/home');
                        } else {
                            res.send('Incorrect password');
                        }
                    }
                });

            }
        });
    } else {
        res.send('Please enter a username and password');
    }
});

app.get('/home', isAuthenticated, (req, res) => {
    res.render('home', { user: req.session.user });
});

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});