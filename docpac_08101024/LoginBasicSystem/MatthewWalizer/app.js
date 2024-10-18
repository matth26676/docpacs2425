const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();
const AUTH_URL = ''
const THIS_URL = ''

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'Temp',
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

app.listen(3000, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('app.js is running on port 3000')
    }
})

const db = new sqlite3.Database('data/Database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to the data/Database.db!')
    }
});

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/home', isAuthenticated, (req, res) => {
    try {
        res.render('home', { user: req.session.user })
    }
    catch (error) {
        res.send(error.message)
    }
})

app.get('/error', (req, res) => {

})

// POST requests

app.post('/login', (req, res) => {
    if (req.body.user && req.body.pass && req.body.email) {
        db.get(`SELECT * FROM Users WHERE Username=?;`, req.body.user, (err, row) => {
            if (err) {
                console.log(err);
                res.send('Whoops! Something went wrong :(');
            } else if (!row) {
                // Create a new salt(key) for the user
                const salt = crypto.randomBytes(16).toString('hex')

                // Uses salt to hash password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        console.log(err)
                        res.send('Whoops! Something went wrong :(')
                    } else {
                        const hashedPassword = derivedKey.toString('hex')
                        db.run(`INSERT INTO Users(Username, Email, Password, Salt) VALUES(?, ?, ?, ?)`, [req.body.user, req.body.email, hashedPassword, salt], (err) => {
                            if (err) {
                                console.log(err);
                                res.send('Whoops! Something went wrong :(')
                            } else {
                                res.send("Created New User!");
                            }
                        })
                    }
                })
            } else if (row) {
                // compares stored password with provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('Whoops! Something went wrong :(')
                    } else {
                        const hashedPassword = derivedKey.toString('hex')
                        if (row.Password === hashedPassword) {
                            req.session.user = req.body.user;
                            res.redirect('/home');
                        } else {
                            res.render("Incorrect Password Please check for errors in password...")
                        }
                    }
                })


            }
        })
    } else {
        res.send("You need a valid username, email, and password")
    }
})