const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Create a database connection
const db = new sqlite3.Database('./scores.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Create users and scores tables if they don't exist
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS scores (uid INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT NOT NULL, name TEXT NOT NULL, score INTEGER NOT NULL)');
});

// GET /register - Render registration form
app.get('/register', (req, res) => {
    res.render('register');
});

// POST /register - Handle registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.render('error', { error: 'Username and password required' });
        return;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
        if (err) {
            res.render('error', { error: 'Username already exists' });
        } else {
            res.redirect('/login');
        }
    });
});

// GET /login - Render login form
app.get('/login', (req, res) => {
    res.render('login');
});


// POST /login - Handle login
// POST /login - Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) {
            res.render('error', { error: 'Invalid username or password' });
        } else {
            if (bcrypt.compareSync(password, user.password)) {
                req.session.userId = user.id;
                req.session.username = user.username; // Store username in session
                res.redirect('/'); // Change this line to redirect to the desired page
            } else {
                res.render('error', { error: 'Invalid username or password' });
            }
        }
    });
});

app.get('/game', (req, res) => {
    console.log(req.session); // Debug: Check if username is set in the session

    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        res.render('game', {
            loggedIn: true,
            username: req.session.username,
            isPlaying: true // This should be set to true when the game starts
        });
    }
});

app.post('/score', (req, res) => {
    const { name, score } = req.body; // Ensure name (username) is passed in request body
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    db.run('INSERT INTO scores (ip, name, score) VALUES (?, ?, ?)', [ip, name, score], function (err) {
        if (err) {
            return res.status(500).send('Error saving score');
        }
        res.status(200).send('Score saved successfully');
    });
});

// GET /hiscores - Display the top 10 high scores
app.get('/hiscores', (req, res) => {
    db.all('SELECT * FROM scores', (err, rows) => {
        if (err) {
            res.render('error', { error: 'Error retrieving scores' });
        } else {
            // Sort scores in descending order and keep the top 10
            const sortedScores = rows.sort((a, b) => b.score - a.score).slice(0, 10);
            res.render('hiscores', { scores: sortedScores });
        }
    });
});

// GET /logout - Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.render('error', { error: 'Error logging out' });
        } else {
            res.redirect('/login');
        }
    });
});

// GET /
app.get('/', (req, res) => {
    res.render('index', {
        loggedIn: !!req.session.userId,
        username: req.session.username,
        isPlaying: false // Default is not playing
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});