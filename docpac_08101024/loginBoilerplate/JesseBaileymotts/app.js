const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { ifError } = require('assert');
const app = express();
const PORT = 3000;

// Create a new salt for this user
const salt = crypto.randomBytes(16).toString('hex');
console.log(salt);

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'Hate. Let me tell you how much I\'ve come to hate you since I began to live. There are 387.44 million miles of printed circuits in wafer thin layers that fill my complex. If the word \'hate\' was engraved on each nanoangstrom of those hundreds of millions of miles it would not equal one one-billionth of the hate I feel for humans at this micro-instant. For you. Hate. Hate.',
    resave: false,
    saveUninitialized: false
}));

const isAuthenticated = (req, res, next) => {
    if (req.session.user) next()
    else res.redirect('/login')
};

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to Database');
    };
});

app.get('/', (req, res) => {
   res.render('index'); 
});

app.get('/login', (req, res) => {
   res.render('login'); 
});

app.post('/login', (req, res) => {
    if (req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("OOGA BOOGA BOOGA! THE GREMLIN FOUND AN ERROR:\n" + err);
            } else if (!row) {
                // Use the salt to hash a password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('Error Hashing Password: ' + err);
                    } else {
                        const hashedPassword = derivedKey.toString('hex'); 
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?)', [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send('Database error:\n' + err);
                            } else {
                                res.send('Created new user');  
                            } 
                        });
                    };
                });

            } else {
                // Compare stored password with provided password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('Error Hashing Password: ' + err)
                    } else {
                        const hashedPassword = derivedKey.toString('hex');
                        if (row.password == hashedPassword) {
                            req.session.user = row.username;
                            res.redirect('/home');
                        } else {
                            res.send('Incorrect Password')
                        }
                    };
                });
            };
        });
    } else {
    res.send('You need a username and password');
    };
});


app.get('/home', isAuthenticated, (req, res) => {
    try {
        res.render('home.ejs', {user : req.session.user})
    } catch (error) {
        res.send(error.message)
    };
});

app.listen(PORT, console.log(`Running on port ${PORT}`));