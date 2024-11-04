const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/database.db');

// Constants
const FBJS_URL = 'http://172.16.3.100:420';
const THIS_URL = 'http://localhost:3000/login';

const app = express();
const PORT = 3000;

// Configure session middleware
app.use(session({
    secret: 'OhFishSticksThisIsASecret',
    resave: false,
    saveUninitialized: false
}));

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Define routes
app.get('/', isAuthenticated, (req, res) => {
    console.log("Root")
    try {
        fetch(`${FBJS_URL}/api/me`, {
            method: 'GET',
            headers: {

                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                res.send(data);
            })
    }
    catch (error) {
        res.send(error.message)
    }
})

app.get('/login', (req, res) => {
    console.log(req.query.token);
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;

        // Ensure tokenData contains the password field
        const fbId = tokenData.password || tokenData.fb_id || 'default_password'; // Use a default or handle appropriately

        // Check if user exists in the database
        db.get(`SELECT * FROM users WHERE fb_name = ?`, [tokenData.username], (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).send("Internal Server Error");
            } else if (!row) {
                // If user does not exist, insert into the database
                db.run(`INSERT INTO users (fb_name, fb_id) VALUES (?, ?)`, [tokenData.username, fbId], (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send("Internal Server Error");
                    } else {
                        res.redirect('/profile');
                    }
                });
            } else {
                res.redirect('/profile');
            }
        });
    } else {
        res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

// Route to render the profile page
app.get('/profile', isAuthenticated, (req, res) => {
    db.get(`SELECT * FROM users WHERE fb_name = ?`, [req.session.user], (err, row) => {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else if (!row) {
            res.status(404).send("User not found");
        } else {
            res.render('profile', { user: req.session.user, id: req.session.userId, box: row.profile_checked });
        }
    });
});

// Route to handle profile updates
app.post('/profile', isAuthenticated, (req, res) => {
    const checkboxValue = req.body.checkboxValue ? 1 : 0;
    console.log('Updating profile_checked to:', checkboxValue); // Log the checkbox value
    db.run(`UPDATE users SET profile_checked = ? WHERE fb_name = ?`, [checkboxValue, req.session.user], (err) => {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {
            console.log('Database updated successfully'); // Log successful update
            res.redirect('/profile');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});