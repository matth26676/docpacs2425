const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const PORT = 3000;
const app = express();
const AUTH_URL = 'http://172.16.3.212:420/oauth'; // ... or the address to the instance of fbjs you wish to connect to
const THIS_URL = 'http://localhost:3000/login'; // ... or whatever the address to your application is

app.set('view engine', 'ejs');

let db = new sqlite3.Database('data/formbarData.db', (err) => {
    if (err) {
        console.err(err);
    } else {
        console.log("It worky")
    }
});

app.use(session({
    secret: 'I am STEVE!',
    resave: false,
    saveUninitialized: false
  }));

  function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};
  

app.get('/', (req, res) => {
     res.render('index');
});

app.get('/login', (req, res) => {
    console.log(req.query.token);
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;

        db.get("SELECT * FROM users WHERE fb_id = ?", [tokenData.id], (err, row) => {
            if (err){ console.log(err); res.render('error'); return; }
            if(!row){
                db.run("INSERT INTO users (fb_id, fb_name, profile_checked) VALUES(?,?,?)", [tokenData.id, tokenData.username, 0], (err) => {
                    if(err) res.render('error');
                    res.redirect('/');
                });
            } else {
                res.redirect('/');
            }
        });

   } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}/login`);
   };
});

app.get('/profile', isAuthenticated, (req, res) => {
    db.get("SELECT * FROM users WHERE fb_id = ?", [req.session.token.id], (err, user) => {
        if (err){
         res.render('error'); return; 
        }
        res.render('profile', {user: user});
    });
});

app.post('/profile', (req, res) => {
    let fb_id = req.session.token.id;
    let checked = (req.body.checkbox === 'checked');
    db.run("UPDATE users SET profile_checked = ? WHERE fb_id = ?;", [String(checked), fb_id], (err) => {
        if (err){
         res.render('error'); return; }
        res.redirect('/profile');
    });
});

app.listen(3000, (err) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log(`Running on PORT 3000`);
    }
})