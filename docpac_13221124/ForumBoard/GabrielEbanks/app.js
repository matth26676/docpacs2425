const jwt = require('jsonwebtoken'); // Imports the jsonwebtoken library for handling JWTs
const express = require('express'); // Imports the Express framework for web applications
const app = express(); // Initializes a new Express application instance
const session = require('express-session'); // Imports middleware for managing user sessions
const sqlite3 = require('sqlite3'); // Imports the SQLite3 module for database operations



app.set('view engine', 'ejs'); // Sets the view engine to EJS for rendering views

app.use(express.urlencoded({ extended: true }))


// Define constants for the authentication server URL and the login URL
const FBJS_URL = 'http://172.16.3.212:420'
const THIS_URL = 'http://localhost:3000/login'
const API_KEY = 'bd4cf1e837768719675cf8bfa360a3e60348af7898a0b61d385a560323423204a9445d4d25bedc5ec4b34626b89598474e45152a9f4ce523d444b0887cf90ed4'

// Configure session management
app.use(session({
    secret: 'ohnose!', // Secret key for signing the session ID
    resave: false, // Prevent resaving session if unmodified
    saveUninitialized: false // Do not save uninitialized sessions
}));

// Open a connection to the SQLite database
const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err); // Log error if connection fails
    } else {
        console.log('we good bruh'); // Confirm successful connection
    }
});

// Middleware to check if a user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) next(); // Proceed if authenticated
    else res.redirect(`/login?redirectURL=${THIS_URL}`); // Redirect to login if not authenticated
}

// Handle GET requests to the root URL
app.get('/', (req, res) => {
    res.render('index'); // Renders the index view
});

// Handle GET requests to the login URL
app.get('/login', (req, res) => {
    console.log(req.query.token); // Log the token from the query string
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token); // Decode the JWT token
        req.session.token = tokenData; // Store token data in session
        req.session.user = tokenData.username; // Store username in session
        res.redirect('/profile'); // Redirect to the profile page
    } else {
        res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`); // Redirect to auth URL if no token
    }
});


// Handle GET requests to the profile page
app.get('/profile', isAuthenticated, (req, res) =>
    db.get('SELECT * from users WHERE fb_name=?;', req.session.user, (error, row) => {
        if (error) {
            res.send(error); // Send error if database query fails
        } else if (row) {
            res.render('profile', { user: req.session.user }); // Render profile view if user exists
        } else {
            // Insert a new user if they do not exist
            db.run('INSERT into users (fb_name, fb_id) VALUES(?,?);', [req.session.user, req.session.token.id], (error) => {
                if (error) {
                    res.send(error); // Send error if insertion fails
                } else {
                    res.render('profile', { user: req.session.user }); // Render profile view for new user
                }
            });
        }
    })
);

// Handle POST requests to update the user's profile
app.post('/profile', (req, res) => {
    db.run('UPDATE users SET profile_checked = ? WHERE fb_id=?', [req.body.check, req.session.token.id], (error) => {
        if (error) {
            res.send(error); // Send error if update fails
        } else {
            res.redirect('/profile'); // Redirect back to the profile page after update
        }
    });
});

// Start the Express server on port 3000
app.listen(3000, () => {
    console.log(`Server started on port 3000`); // Log confirmation message
});


