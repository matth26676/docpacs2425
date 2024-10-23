const sqlite3 = require('sqlite3');
const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const session = require('express-session');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true }))

app.use(session({
    secret: 'balls',
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('i like my cheese drippy bruh')    
    }
});

app.get('/', (req, res) => {
    res.render('index');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', (req, res) => {
    if (req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("there was an error:\n" + err);
            } else if (!row) {
                // create new salt for this user
                const salt = crypto.randomBytes(16).toString('hex')
                
                // use salt to hash the password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password: " + err);
                    } else {
                        const hashedPassword = derivedKey.toString('hex');
                        db.run('INSERT INTO users(username, password, salt) VALUES(?, ?, ?);', [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send("Database error:\n" + err)
                            } else {
                                res.send("Created new user")
                            }
                        });
                    }
                });
            } else {
                //compare stored password with provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) =>{
                    if (err) {
                        res.send("error hashing password: " + err);

                    } else {
                        const hashedPassword = derivedKey.toString('hex');

                        if (row.password === hashedPassword){
                            req.session.user = req.body.user;
                            res.redirect('/home');

                        } else {
                            res.send("incorrect password")
                        }
                    }
                })


            }
        })

    } else {
        res.send("you need a username and a password");
    }

})

app.get('/home', isAuthenticated, (req, res) => {
     res.render('home.ejs', {user : req.session.user})
})


app.listen(3000, () => {
    console.log("server started on port 3000")
});