const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const session = require('express-session');
const sqlite3 = require('sqlite3');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const FBJS_URL = 'https://formbar.yorktechapps.com';
const THIS_URL = 'http://localhost:3000/login';
const API_KEY = 'bd4cf1e837768719675cf8bfa360a3e60348af7898a0b61d385a560323423204a9445d4d25bedc5ec4b34626b89598474e45152a9f4ce523d444b0887cf90ed4';

app.use(session({
    secret: 'ohnose!',
    resave: false,
    saveUninitialized: false
}));

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('we good bruh');
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect(`/login?redirectURL=${THIS_URL}`);
}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    console.log(req.query.token);
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        res.redirect('/profile');
    } else {
        res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/profile', isAuthenticated, (req, res) =>
    db.get('SELECT * from users WHERE fb_name=?;', req.session.user, (error, row) => {
        if (error) {
            res.send(error);
        } else if (row) {
            res.render('profile', { user: req.session.user });
        } else {
            db.run('INSERT into users (fb_name, fb_id) VALUES(?,?);', [req.session.user, req.session.token.id], (error) => {
                if (error) {
                    res.send(error);
                } else {
                    res.render('profile', { user: req.session.user });
                }
            });
        }
    })
);

app.post('/profile', (req, res) => {
    db.run('UPDATE users SET profile_checked = ? WHERE fb_id=?', [req.body.check, req.session.token.id], (error) => {
        if (error) {
            res.send(error);
        } else {
            res.redirect('/profile');
        }
    });
});

app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});
