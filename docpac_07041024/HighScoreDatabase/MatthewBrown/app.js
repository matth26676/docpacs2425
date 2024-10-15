const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Check if the database file exists
const dbPath = './database.db';
if (fs.existsSync(dbPath)) {
    console.log('Database file exists.');
} else {
    console.log('Database file does not exist. It will be created.');
}

// Create or open the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS scores (
            uid INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            name TEXT NOT NULL,
            score INTEGER NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            } else {
                console.log('Table "scores" created or already exists.');
            }
        });
    }
});

// Define the root route
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.get('/hiscores', (req, res) => {
    db.all('SELECT * FROM scores ORDER BY score DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            return res.render('error', { error: err.message });
        }
        res.render('hiscores', { scores: rows });
    });
});

app.post('/hiscores', (req, res) => {
    const { name, score } = req.body;
    const ip = req.ip;

    if (!name || !score) {
        return res.render('error', { error: 'Name and score are required' });
    }

    const query = 'INSERT INTO scores (ip, name, score) VALUES (?, ?, ?)';
    db.run(query, [ip, name, score], function(err) {
        if (err) {
            return res.render('error', { error: err.message });
        }
        res.redirect('/hiscores');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});