const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db'); // Adjust the path as necessary
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { session: req.session });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT password FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            return res.status(500).send('Error retrieving user from database');
        }

        if (!row) {
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).send('Error hashing password');
                }

                db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
                    if (err) {
                        return res.status(500).send('Error storing user in database');
                    }

                    req.session.user = { username };
                    res.redirect('/');
                    console.log("New user created and logged in " + username);
                });
            });
        } else {
            bcrypt.compare(password, row.password, (err, result) => {
                if (err) {
                    return res.status(500).send('Error comparing passwords');
                }

                if (!result) {
                    return res.status(401).send('Invalid username or password');
                }

                req.session.user = { username };
                res.redirect('/');
                console.log("User logged in " + username);
            });
        }
    });
});

router.get('/logout', (req, res) => {
    const username = req.session.user ? req.session.user.username : 'Unknown user';
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to destroy session');
        }
        console.log("User logged out " + username);
        res.redirect('/');
    });
});

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};

router.get('/chat', isAuthenticated, (req, res) => {
    if (req.session.user && req.session.user.username) {
        res.render('chat', { username: req.session.user.username });
    } else {
        res.redirect('/login');
    }
});

module.exports = router;