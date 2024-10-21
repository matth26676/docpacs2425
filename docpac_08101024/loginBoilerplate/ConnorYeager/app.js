const sqlite3 = require('sqlite3').verbose();
const express = require('express')
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
const session = require('express-session');
const { log } = require('console');

const app =express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}))

app.use(session({
    secret: 'WeGotANumber1VictoryRoyale!',
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('It worky');
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    console.log(req.body.user);
    console.log(req.body.pass);
    if(req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("There was an error:\n" +err);
            } else if (!row) {
                //create a new salt for this user
                const salt = crypto.randomBytes(16).toString('hex');
                
                //use the salt to hash the password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password: " + err);
                    } else {
                        const hashedPassword = derivedKey.toString('hex');
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send("Database error:\n" + err);
                            } else {
                                res.send("Created new user!");
                            }
                        });
                    }
                });
            } else {
                //Compare stored password with provided passwor
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password:" + err);
                    } else {
                        const hashedPassword = derivedKey.toString('hex');

                        if (row.password === hashedPassword) {
                            req.session.user = req.body.user;
                            res.redirect('/home');

                        } else {
                            res.send("Incorrect Password.")
                        }
                    }
                });
            }
        });
    } else {
        res.send("You need a username and password!")
    }
});

app.get('/home', isAuthenticated, (req, res) => {
    res.render('home.ejs', { user: req.session.user })
});

app.listen(3000, () => {
    console.log('Server started on PORT 3000.')
});