const jwt = require('jsonwebtoken')
const express = require('express')
const app = express()
const session = require('express-session')

const AUTH_URL = 'http://localhost:420/oauth'; // ... or the address to the instance of fbjs you wish to connect to
const THIS_URL = 'http://localhost:3000/login'; // ... or whatever the address to your application is

app.use(session({
    secret: 'secretStringHere',
    resave: false,
    saveUninitialized: false
  }))

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