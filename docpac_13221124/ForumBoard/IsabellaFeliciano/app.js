// importing required modules
const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { log } = require('console');

app.use(express.urlencoded({ extended: true }));

// setting up routes
app.get('/', (req, res) => {
    res.render('index');
});

app.use(session({
    secret: "put your secret here- Nah I'm Good",
    resave: false,
    saveUninitialized: false
}));

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    if (req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("There was an error:\n" + err);
            } else if (!row) {
                // create a new salt forthis user
                const salt = crypto.randomBytes(16).toString('hex');

                // use salt to "hash"
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password: " + err);
                    } else {
                        const hashedPassword = derivedKey.toString('hex');
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send("Databse error:\n" + err)
                            } else {
                                res.send("Created new user")
                            }
                        });
                    }
                });

            } else if (row) {
                // compare stored password w provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashinf password: " + err);
                    } else {
                        const hashedPassword = derivedKey.toString('hex');

                        if (row.password === hashedPassword) {
                            req.session.user = req.body.user;
                            res.redirect('/home');
                        } else {
                            res.send("Incorrect Password")
                        }
                    }
                })
            }
        })
    } else {
        res.send("You need a username and password");
    }
})

// chat route
app.get('/chat', (req, res) => {
    if (req.query.name) {
        res.render('chat', { user: req.query.name })
    } else (
        res.redirect('/')
    )
});

app.get('/home', isAuthenticated, (req, res) => {
    res.render('home.ejs', { user: req.session.user })
})

app.post('/chat', (req, res) => {
    const userMessage = req.body.message;
    // Here you can process the message and generate a response
    const reply = `You said: ${userMessage}`; // Example response
    res.json({ reply });
});

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

const db = new sqlite3.Database('data/Mydatabase.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('initialize');
    }
});

// setting up view engine
app.set('view engine', 'ejs');

app.listen(3000, (err) => {
    log("running on port 3000")
})