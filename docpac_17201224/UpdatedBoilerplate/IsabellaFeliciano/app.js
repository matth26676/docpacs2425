// import the modules
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express(); app.set('view engine', 'ejs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3');
const port = 3000;

// create a session middleware
const sessionMiddleware = session({
    sttore: new SQLiteStore,
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // sets to true if using  https
})

// use the session middleware
app.use(sessionMiddleware)
app.use(express.urlencoded({ extended: true }));






app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('/login')
});

app.get('/chat', (req, res) => {
    res.render('/chat')
});

app.get('/routes', (req, res) => {
    res.render('/routes')
});

app.get('/socket', (req, res) => {
    res.render('/routes')
});

// create a port to listen to the server
app.listen(port, () => {
    console.log('listening at http://localhost:3000');
});