const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const AUTH_URL = 'http://172.16.3.100:420/oauth'; // address to the instance of fbjs to connect to

const THIS_URL = 'http://localhost:3000/login'; // the address to your application is

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'ihiuhiuuiuiogu7inigiuhiuniuihjniuguiouih0uohiouniubgoujhhudashcfljasndviousadhgxdnsvcoui',
    resave: false,
    saveUninitialized: false
}))

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('database accepted');
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.token) next()
    else res.redirect('/login')
};

app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('index.ejs', { fb_name: req.session.user })
    }
    catch (error) {
        res.send(error.message)
    }
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        req.session.uid = tokenData.id;
        req.session.logIn = tokenData.loggedIn
        console.log(tokenData);
        console.log(tokenData.username);
        console.log(tokenData.id);
        console.log(req.session.uid);


        db.get(`SELECT fb_name, fb_id, profile_checked FROM users`, (err, row) => {
            if (err) {
                res.send("There was an error:\n" + err);
            }
            else if (!row) {
                db.run(`INSERT INTO users (fb_name, fb_id, profile_checked) VALUES (?, ?, ?);`, [req.session.user, req.session.uid, null], (err) => {
                    if (err) {
                        res.send('Database error:\n' + err)
                    }
                })
            }
        })
        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.get('/profile', (req, res) => {
    if (req.session.user === undefined) {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    } else {
        res.render('profile.ejs', { fb_name: req.session.user, fb_id: req.session.uid })
    }
});

app.post('/profile', (req, res) => {
    var checked = req.body.check

    console.log(checked);
    if (checked === 'on') {
        checked = true
    } else {
        checked = false
    }

    db.get(`SELECT fb_id, profile_checked FROM users`, (err, row) => {
        if (err) {
            res.send("There was an error:\n" + err);
        } else {
            let uid = row.fb_id
            console.log(uid);
            uid = parseInt(uid)
            console.log(uid);
            db.run(`UPDATE users SET profile_checked=? WHERE fb_id=?`, [checked, uid], (err) => {
                if (err) {
                    res.send('Database error:\n' + err)
                } else {
                    db.get(`SELECT profile_checked FROM users`, (err, row) => {
                        console.log(row.profile_checked + ": This is a check");
                    })
                }
            })
        }
    })
    console.log(checked + ": End of function");
    res.render("profile", { fb_name: req.session.user, fb_id: req.session.uid })
});

app.listen(3000)