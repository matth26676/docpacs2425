const jwt = require('jsonwebtoken')
const express = require('express')
const session = require('express-session')
const sqlite3 = require('sqlite3')

const app = express()
const PORT = 3000

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.json());

const FBJS_URL = 'http://172.16.3.212:420'
const THIS_URL = 'http://localhost:3000/login'
//Switch this to your api key frfr mr.smiff
const API_KEY = 'ab0b55e6f386c205910ff40dc45179abbc2d4fad6d02dff7c0e148e5dcf25bac26016b53f5711fce424de0a1e9acade3cab2c3d7a1d1a3c080a5511805209059'

//This is the secret key for the session
app.use(session({
    secret: 'ThisIsTopMilitarySecret',
    resave: false,
    saveUninitialized: false
}))

//This is ogga bogga middle ware to check for users auth
function isAuthenticated(req, res, next) {
    console.log("Checking Auth");
    if (req.session.user) next();
    else res.redirect(`/login?redirectURL=${THIS_URL}`);
}

//Burh
const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.error('Database opening error: ', err);
    } else {
        console.log('Database opened');
    }
});

app.get('/', isAuthenticated, (req, res) => {
	res.render('index.ejs');
});

app.get('/login', (req, res) => {
    console.log('Token print');
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.username
        res.redirect('/')
    } else {
        console.log('Token not defined');
        res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`)
    }
})

app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile.ejs', { username: req.session.user });
});

app.post('/profile', isAuthenticated, (req, res) => {
    let checked = req.body.checkbox ? 1 : 0;
    let fb_name = req.session.user;
    let fb_id = req.session.token.id;

    db.run('INSERT INTO users (fb_id, fb_name, profile_checked) VALUES (?, ?, ?)', [fb_id, fb_name, Number(checked)], (err) => {
        if (err) {
            console.error('Database error: ', err);
        } else {
            res.redirect('/profile');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});