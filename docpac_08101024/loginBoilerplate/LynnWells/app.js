//Declares all the modules used
const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const powerLevel = 9001;

//Sets the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'First Death. I felt something.', //Don't publish this with it here
    //maybe put it in settings.json and set it to git ignore
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next() //if there's a username in the token, go ahead
    else res.redirect('/login') //if not, go to login page
};

//db is shorthand to reference the database
const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('we good bruh'); //Hooray!
    }
});

//Displays the index.ejs by default
app.get('/', (req, res) => {
    res.render('index');
});

//Displays the login page
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    console.log(req.body.user); //Prints new username in console
    console.log(req.body.pass); //Prints new password in console
    if (req.body.user && req.body.pass) { //If there's a username and password
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("There wan an error:\n" + err)
            } else if (!row) {
                //create new salt for this user
                const salt = crypto.randomBytes(16).toString('hex')

                //use salt to "hash" password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.setDefaultEncoding("Error hashing password: " + err)
                    } else {
                        const hashedPassword = derivedKey.toString('hex')
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send("Database errpr:\n" + err)
                            } else {
                                res.send("Created new user") //Feel free to change this lol
        
                            }
                        })
                    }
                })

            } else {
                //Compare stored password with provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password: " + err)
                    } else {
                        const hashedPassword = derivedKey.toString('hex')

                        if (row.password === hashedPassword) {
                            req.session.user = row.username
                            res.redirect("/home")
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

app.get('/home', isAuthenticated, (req, res) => {
    res.render('home.ejs', { user: req.session.user })
})

app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});
