const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken');
const express = require('express');
const session = require('express-session');
const AUTH_URL = 'http://172.16.3.100:420/oauth';
const THIS_URL = 'http://localhost:3000/login';

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'totallyASecret',
    resave: false,
    saveUninitialized: false
}))


const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Database is up');
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};


app.get('/', (req, res) => {
    res.render('homepage')
});


app.get('/login', (req, res) => {
    
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        req.session.id = tokenData.id
        res.render('profile.ejs', {user: tokenData.username, id: tokenData.id});
        
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`)
    }
});

app.get('/profile', isAuthenticated, (req, res) => {
    try {
        console.log(req.session.user)
        res.render('profile');
    } catch (err) {
        res.send(err.message)
    };
});


app.post('/profile', isAuthenticated, (req, res) => {
    checked = req.body.checking
    id = req.session.token.id;
    user = req.session.user

    console.log(req.session.user);
    
    console.log(checked)
    if (user && checked) {
        db.run('INSERT INTO users (fb_id, fb_name, profile_Checked) VALUES (?, ?, ?);', [id, user, checked], (err, row) => {
            if (err) {
                res.send('Database error:\n' + err)
            } else {
                res.send("You good mate")
            }
        })
    }
});


app.listen(3000, () => {
    console.log('Connected to port 3000')
});