const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { profile } = require('console');

const app = express();
const formbarURL = 'http://172.16.3.212:420'
const myURL = 'http://localhost:3000/login'
const API_KEY = '13e1473ed2bafb33a4dc0fa3d81ca29a271c5d54bf46f7e2bf9a502d6cbad5a6e651a520ef2bcdcfc0a904208b660e0c0469575cc6343ad96f5c0a3513834e7d'

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'MUG',
    resave: false,
    saveUninitialized: false
  }))

function authenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect(`/login?redirectURL=${myURL}`)
};

const db = new sqlite3.Database('data.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

app.get('/', authenticated, (req, res) => {
    res.render('index');
})

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.username
        res.redirect('/')
    } else {
        res.redirect(`${formbarURL}/oauth?redirectURL=${myURL}`)
    }
});

app.get('/profile', authenticated, (req, res) => {
    try {
        fetch(`${formbarURL}/api/me`, {
            method: 'GET',
            headers: {
                'API': API_KEY,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                db.get(`SELECT * FROM users WHERE fb_id = ?`, [req.session.token.id], (err, row) => {
                    if (err) {
                        return console.error(err.message);
                    } else {
                        if (row) {
                            let profile_checked = row.profile_checked
                            res.render('profile', { data: data, profile_checked: profile_checked });
                        } else {
                            res.render("profile", {data:data, profile_checked: 0})
                        }

                    }
                });
            })
    }
    catch (error) {
        res.send(error.message)
    }
});

app.post('/profile', (req, res) => {
    let checkbox = req.body.checkbox ? 1 : 0;
    let id = req.session.token.id
    let username = req.session.user
    try {
        db.get(`SELECT * FROM users WHERE fb_id = ?`, [id], (err, row) => {
            if (err) {
                return console.error(err.message);
            } else {
                if (row) {
                    db.run(`UPDATE users SET profile_checked = ?`, [checkbox], (err) => {
                        if (err) {
                            return console.error(err.message);
                        } else {
                            res.redirect('/profile')
                        }
                    });
                } else {
                    db.run(`INSERT INTO users (fb_id, fb_name, profile_checked) VALUES (?, ?, ?)`, [id, username, checkbox], (err) => {
                        if (err) {
                            return console.error(err.message);
                        } else {
                            res.redirect('/profile');
                        }
                    });
                }
            }
        })


    } catch (error) {
        res.send(error.message)
    }
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});