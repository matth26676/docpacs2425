const express = require('express')
const sqlite3 = require('sqlite3')
const jwt = require('jsonwebtoken');
const session = require('express-session');
const app = express()

app.use(express.urlencoded({extended: true}))

const FBJS_URL = 'http://172.16.3.212:420/oauth'; // ... or the address to the instance of fbjs you wish to connect to
const THIS_URL = 'http://localhost:3000/login'; // ... or whatever the address to your application is

app.use(session({
    secret: 'Moon Pies are good af',
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/login')
    }
};

const db = new sqlite3.Database('data.db', (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('database is working')
    }
})

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        console.log(tokenData)
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        db.get('SELECT * FROM users WHERE fb_name = ? AND fb_id = ?', [req.session.user, req.session.token.id], (err, row) => {
            if (err) {
                console.log(err)
            } else if (!row) {
                db.run('INSERT INTO users(fb_name , fb_id) VALUES(?, ?)', [req.session.user, req.session.token.id], (err) => {
                    if (err) {
                        console.log(err)
                    }
                })
                res.redirect('/profile');
            } else {
                res.redirect('/profile');
            }
        })
    } else if (req.session.user) {
        res.redirect('/profile')
    } else {
        res.redirect(`${FBJS_URL}?redirectURL=${THIS_URL}`);
    };
});

app.get('/profile', isAuthenticated, (req, res) => {
    try {
        res.render('profile', { user: req.session.user })
    }
    catch (error) {
        res.send(error.message)
    }
})

app.post('/profile', (req, res) => {
    db.run('UPDATE users SET profile_checked = ? WHERE fb_name = ? AND fb_id = ?', [req.body.check, req.session.user, req.session.token.id], (err) => {
        if (err) {
            console.log(err)
        }
    })
})

app.listen(3000, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('server running on port 3000')
    }
})