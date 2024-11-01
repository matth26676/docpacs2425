const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.error(err.message)
    } else {
        console.log('Connected to the database.')
    }
})

const AUTH_URL = 'http://172.16.3.100:420/oauth'; // ... or the address to the instance of fbjs you wish to connect to
const THIS_URL = 'http://localhost:3000/login'; // ... or whatever the address to your application is

app.use(session({
    secret: 'ThisIsMySecretStringThatShouldBeLongAndRandomThatNoOneWillGuessAtAllDidYouGuessItYetNoYouDidntCauseItsVeryLongAndRandomJustLikeThisString',
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

app.get('/', (req, res) => {
    res.render('homepage');
});

app.get('/profile', isAuthenticated, (req, res) => {
    try {
        res.render('profile', { user: req.session.user });
    } catch (err) {
        res.send(err.message);
    }
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        res.redirect('profile');
        db.get('SELECT * FROM users WHERE fb_name = ?', req.session.user, (err, row) => {
            if (err) {
                console.error(err);
            } else if (!row) {
                db.run('INSERT INTO users (fb_name, fb_id, profile_checked) VALUES (?,?,?);', [tokenData.username, tokenData.id, 0]);
            }
        });
        // res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.post('/profile', (req, res) => {
    if (req.body.profile_checked) {
        db.run(`UPDATE users SET profile_checked = 1 WHERE fb_name = ?`, [req.session.user], (err) => {
            if (err) {
                console.log(err);
            }
        });
    } else {
        db.run(`UPDATE users SET profile_checked = 0 WHERE fb_name = ?`, [req.session.user], (err) => {
            if (err) {
                console.log(err);
            }
        });
    }

    res.redirect('/profile');
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});