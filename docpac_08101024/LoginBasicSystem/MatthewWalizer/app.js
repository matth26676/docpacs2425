const sqlite3 = require('sqlite3')
const express = require('express');
const { error, log } = require('console');
const fs = require('fs')
const crypto = require("crypto-js");

// sets app.js to use expressjs files on port 3000
const app = express();
const port = 3000;
const key = "P@$$w0rdK3y"

// sets app to view files in ejs and to respond with text
app.set('view engine', 'ejs');
app.use(express.text())
app.use(express.urlencoded({extended:true}));

// sets the port used to port 3000
app.set('port', process.env.PORT || 3000);

// logs each request
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// starts the server
app.listen(port, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Server listening on port ${port}`);
    }
});

let db = new sqlite3.Database('data/Database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the data/Database database')
});

app.get('/', (req, res) => {
    res.render('index', {key: key})
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/home', (req, res) => {
    var user = req.query.user
    var email = req.query.email
    res.render('home', {user: user, email: email})
})

app.get('/error', (req, res) => {
    res.render('error', {err: err})
})

app.post('/login', (req, res) => {
    try {
        if (!req.body.name) {
            throw Error("Username isn't valid!")
        } else if (!req.body.email) {
            throw Error("Email isn't valid!")
        } else if (!req.body.password) {
            throw Error("Password isn't valid!")
        } else {
            let password = crypto.AES.encrypt(req.body.password, key).toString();
            db.all(`SELECT * FROM Users WHERE Username=? AND Password=?`, req.body.name, password, (err, row) => {
                if (err) {
                    res.render('error', {err: err})
                } else {
                    res.redirect(`home?user=${req.body.name}&email=${req.body.email}`)
                }
            })
        }
    } catch (err) {
        res.render('error', {err: err})
    }
})

app.post('/signup', (req, res) => {
    try {
        if (!req.body.name) {
            throw Error("Username isn't valid!")
        } else if (!req.body.email) {
            throw Error("Email isn't valid!")
        } else if (!req.body.password) {
            throw Error("Password isn't valid!")
        } else {
            let password = crypto.AES.encrypt(req.body.password, key).toString();
            db.run(`INSERT INTO Users(Username, Email, Password) VALUES(?, ?, ?)`,[req.body.name, req.body.email, password] ,(err, row) => {
                if (err) {
                    res.render('error', {err: err})
                } else {
                    res.render('login')
                }
            })
        }
    } catch (err) {
        res.render('error', {err: err})
    }
})