const jwt = require('jsonwebtoken');
const session = require('express-session');
const express = require('express');
const sqlite3 = require('sqlite3');


const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true }))


const AUTH_URL = 'http://172.16.3.100:420/oauth'; // ... or the address to the instance of fbjs you wish to connect to
const THIS_URL = 'http://localhost:3000/login'; // ... or whatever the address to your application is

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('i like my cheese drippy bruh')
    }
});

app.use(session({
    secret: 'big raga the opp stoppa',
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/profile', isAuthenticated, (req, res) => {
    try {
        res.render('profile', { user: req.session.user })
    }
    catch (error) {
        res.send(error.message)
    }
})

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        console.log(tokenData)
        req.session.user = tokenData.username;
        req.session.userid = tokenData.id;

        db.get('SELECT * FROM users WHERE fb_name=?', req.session.user, (err, row) => {
            if (err) {
                console.log(err)
                res.send("There big bad error:\n" + err)
            } else if (!row) {
                db.run('INSERT INTO users(fb_name, fb_id) VALUES(?, ?);', [req.session.user, req.session.userid], (err) => {
                    if (err) {
                        console.log(err)
                        res.send("Database error:\n" + err)
                    }
                });
            }
        });

        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.post('/profile', (req, res) => {
    db.run('UPDATE users SET profile_checked=? WHERE fb_id=?', [req.body.profile_checked, req.session.userid], (err) => {
        if (err) {
            console.log(err)
            res.send("Database error:\n" + err)
        }
    });
})





app.listen(3000, (err) => {
    if (err) {
        console.log(err)
    }
    console.log("server started on port 3000")
});