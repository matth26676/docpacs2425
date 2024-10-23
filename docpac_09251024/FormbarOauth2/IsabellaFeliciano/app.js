const jwt = require('jsonwebtoken');
const session = require('express-session');
const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();

app.set('view engine', 'ejs');  

const AUTH_URL = 'http://172.16.3.212:420/oauth';
const THIS_URL = 'http://localhost:3000/login';

app.use(session({
    secret: 'make up a secret string here but never publish it!',
    resave: false,
    saveUninitialized: false
}))

const db = new sqlite3.Database('Data/MyDatabase.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Today is a good day');
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/profiles', isAuthenticated, (req, res) => {
    try {
        res.render('profiles', { user: req.session.user })
    }
    catch (error) {
        res.send(error.message)
    }
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        console.log(tokenData);
        req.session.user = tokenData.username;
        req.session.userid = tokenData.id;

        db.get('SELECT * FROM users WHERE fb_name=? AND fb_id=?;', [req.session.user, tokenData.id], (err, row) => {
            if (err) {
                console.error(err);
                res.send("There was an error:\n" + err);
            } else if (!row) {
                db.run('INSERT INTO users(fb_name, fb_id) VALUES(?)', req.session.user, (err) => {
                    if (err) {
                        console.error(err);
                        res.send("There was an error:\n" + err);
                    }
                });
            }
        })
    
        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.listen(3000, (err) => {
    if (err) {
        console.log(err)
    }
    console.log(`Server started on port 3000`);
});