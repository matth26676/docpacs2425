const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const http = require('http');

const { profile } = require('console'); //I HATE THIS STUPID THING DIEEEEEEEE

const app = express();
const formbarURL = 'https://formbar.yorkTechApps.com'
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
        req.session.user = tokenData.username
        req.session.token = tokenData
        res.redirect('/')
    } else {
        res.redirect(`${formbarURL}/oauth?redirectURL=${myURL}`)
    }
});

app.get('/page', authenticated, (req, res) => {
    console.log('page for forums');

    db.all('SELECT title FROM forum;', (err, rows) => {
        if (err) {
            res.send("ERROR:\n" + err);
            console.error(err);
        } else {
            res.render('page', { user: req.session.user, forums: rows });
        }
    });
});

app.post('/page', (req, res) => {
    const aForum = req.body.aForum;
    const user = req.session.user;

    console.log(req.body.aForum);
    console.log(req.session.user);

    db.run('INSERT INTO forum (creator, title) VALUES (?, ?);', [user, aForum], (err) => {
        if (err) {
            res.send('DB ERROR:\n' + err);
        } else {
            res.redirect('/page');
        }
    });
});

app.get('/chatroom/:aForum', authenticated, (req, res) => {
    const aForum = req.params.aForum;

    console.log('chatroom for forum:', aForum);

    db.all('SELECT user, content, date FROM messages WHERE forum = ? ORDER BY date ASC;', [aForum], (err, rows) => {
        if (err) {
            console.error(err);
            res.send("ERROR:\n" + err);
        } else {
            res.render('chatroom', { user: req.session.user, aForum: aForum, messages: rows });
        }
    });
});

app.post('/chatroom/:aForum', (req, res) => {
    const aForum = req.params.aForum;
    const user = req.session.user;
    const message = req.body.message;
    const date = new Date().toISOString();

    db.run('INSERT INTO messages (user, forum, content, date) VALUES (?, ?, ?, ?);', [user, aForum, message, date], (err) => {
        if (err) {
            res.send('DB ERROR:\n' + err);
        } else {
            res.redirect(`/chatroom/${aForum}`);
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});