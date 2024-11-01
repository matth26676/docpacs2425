// importing required packages
const jwt = require('jsonwebtoken');
const session = require('express-session');
const express = require('express');
const sqlite3 = require('sqlite3');

// initializing express app
const app = express();

// setting view engine to ejs
app.set('view engine', 'ejs');

// parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

// defining constants for authentication URL and current URL
const AUTH_URL = 'http://172.16.3.212:420/oauth';
const THIS_URL = 'http://localhost:3000/login';

// configuring session middleware
app.use(session({
    secret: 'make up a secret string here but never publish it!',
    resave: false,
    saveUninitialized: false
}))

// initializing SQLite database
const db = new sqlite3.Database('Data/MyDatabase.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Today is a good day');
    }
});

// middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

// setting up routes
app.get('/', (req, res) => {
    res.render('index');
})

// route to display user profiles
app.get('/profiles', isAuthenticated, (req, res) => {
    try {
        res.render('profiles', { user: req.session.user })
    }
    catch (error) {
        res.send(error.message)
    }
});

// route to handle login
app.get('/login', (req, res) => {
    if (req.query.token) {
        // decoding the JWT token
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        console.log(tokenData);
        // storing user information in session
        req.session.user = tokenData.username;
        req.session.userid = tokenData.id;

        // checking if user exists in the database
        db.get('SELECT * FROM users WHERE fb_name=? AND fb_id=?;', [req.session.user, tokenData.id], (err, row) => {
            if (err) {
                console.error(err);
                res.send("There was an error:\n" + err);
            } else if (!row) {
                // inserting new user into the database
                db.run('INSERT INTO users(fb_name, fb_id) VALUES(?, ?)', [req.session.user, tokenData.id], (err) => {
                    if (err) {
                        console.error(err);
                        res.send("There was an error:\n" + err);
                    }
                });
                // redirecting to profiles page after successful login
                res.redirect('/profiles');
            } else {
                res.redirect('/profiles');
            }
        })

        // redirecting to home page after successful login
    } else if (req.session.user) {
        res.redirect('/profiles');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.post("/profiles", (req, res) => {
    // console.log(req.body)
    db.run('UPDATE users SET profile_checked = ? WHERE fb_id = ? AND fb_name = ?', [req.body.checkbox, req.session.userid, req.session.user], (err) => {
        if (err) {
            console.error(err)
        }
    })
})

// route to handle logout
app.listen(3000, (err) => {
    if (err) {
        console.log(err)
    }
    console.log(`Server started on port 3000`);
});