const sqlite3 = require('sqlite3');
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { execFile } = require('child_process');
const THIS_URL = 'http://localhost:3000/login'; // ... or whatever the address to your application is
const app = express();
const AUTH_URL = 'http://172.16.3.212:420/oauth'; // Authentication URL
const API_KEY = 'bd4cf1e837768719675cf8bfa360a3e60348af7898a0b61d385a560323423204a9445d4d25bedc5ec4b34626b89598474e45152a9f4ce523d444b0887cf90ed4'; // Replace with your actual API key


app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))


function isAuthenticated(req, res, next) {
	console.log("Checking Auth")
	if (req.session.user) next()
	else res.redirect(`/login?redirectURL=${THIS_URL}`)
}

app.use(session({
    secret: 'africanbootyscratcher',
    resave: false,
    saveUninitialized: false
}))



const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('we good bruh');
    }
});

app.get('/', isAuthenticated, (req, res) => {
    try {
         res.render('index.ejs', {user : req.session.user})
    }
    catch (error) {
         res.send(error.message)
    }
});

app.get('/login', (req, res) => {
	console.log(req.query.token)
	if (req.query.token) {
		let tokenData = jwt.decode(req.query.token)
		req.session.token = tokenData
		req.session.user = tokenData.username
		res.redirect('/')
	} else {
		res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`)
        console.log('working')
	}
})

app.post('/login', (req, res) => {
    console.log(req.body)
    if (req.body.user && req.body.pass) {
        db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
            if (err) {
                console.error(err);
                res.send("Ther was an error: \n" + err);
            } else if (!row) {

                const salt = crypto.randomBytes(16).toString('hex')

                //use the salt to 'hash' the password 
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('error hashing password') + err
                    } else {
                        const hashedPassword = derivedKey.toString('hex')
                        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send('Database error: \n' + err)
                            } else {
                                res.send('created new user')
                            }
                        })
                    }
                })

            } else if (row) {
              
                // Compare stored password with provided password 
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
                    if (err) {
                        res.send('Error hasing password')
                    } else {
                        hashedPassword = derivedKey.toString('hex')
            
                        if (row.password === hashedPassword) {
                            req.session = req.body.userres.redirect('/home')
                        } else {
                            res.send('incorrect password')
                        }
                    }
                })

            }
        })
    } else {
        res.send("You need a username and password");
    }

    

})

// app.get('/home', isAuthenticated, (req, res) => {

//     res.render('home.ejs', { user: req.session.user })

// })


app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});


// 5.	If the project requires you to provide a login, create an entry with the username “testuser” and the password “password123!”