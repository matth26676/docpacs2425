const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/database.db');

// Constants
const FBJS_URL = 'http://172.16.3.212:420';
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
    console.log("Checking Auth");
    console.log('Session Data:', req.session); // Log the session data
    if (req.session.user) {
        next();
    } else {
        res.redirect(`/login?redirectURL=${encodeURIComponent(req.originalUrl)}`);
    }
}

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Define routes
app.get('/', (req, res) => {
    res.redirect('/login'); // Redirect to the login page
});

app.get('/login', (req, res) => {
    console.log('Login route hit');
    console.log('Token:', req.query.token);
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        console.log('Decoded Token Data:', tokenData); // Log the decoded token data
        req.session.token = tokenData;
        req.session.user = tokenData.username; // Ensure this matches the token data structure
        req.session.userId = tokenData.id; // Store id in session
        console.log('Session Data:', req.session); // Log the session data
        res.redirect('/profile'); // Redirect to /profile after setting the session
    } else {
        res.render('login'); // Render the login page if no token is provided
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