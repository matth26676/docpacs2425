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
  

app.get('/', isAuthenticated, (req, res) => {
    try {
         res.render('index.ejs', {user : req.session.user})
    }
    catch (error) {
         res.send(error.message)
    }
});

app.get('/login', (req, res) => {
    if (req.query.token) {
         let tokenData = jwt.decode(req.query.token);
         req.session.token = tokenData;
         req.session.user = tokenData.username;
         res.redirect('/');
    } else {
         res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.get('/profile', isAuthenticated, (req, res) => {

});

app.post('/profile', (req, res) => {

});

app.listen(3000, (err) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log(`Running on PORT 3000`);
    }
})