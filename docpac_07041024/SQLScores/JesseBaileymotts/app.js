// Sets up all the constants such as the port the program runs on and SQLite3
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Sets the view engine to EJS to allow for its use
app.set('view engine', 'ejs');
app.use(express.json());

// Assigns a sqlite3 database to a variable
let db = new sqlite3.Database('data/mydb.db', (err) => {
    // Catches any errors that may occur
    if (err) {
        console.error(err.message);
    // Logs that the database is connected if all goes well
    } else {
        console.log('Connected to the mydb database');
    };
});

// Renders the index page when app is run
app.get('/', (req, res) => {
    res.render('index');
});

// Renders game.ejs
app.get('/game', (req, res) => {
    res.render('game');
});

// Renders highscores.ejs and gets all from the users table
app.get('/highscores', (req, res) => {
    try {
        // Orders users by their score in descending order
        db.all('SELECT * FROM users ORDER BY score DESC', (err, rows) => {
            if (err) {
                console.error(err.message);
            };
            // Gets only the top 10
            rows = rows.slice(0, 10);
            // Renders higscores.ejs and assigns the rows to users
            res.render('highscores', {users: rows});
        });
    // Catches any errors and renders the error page if any occur
    } catch (err) {
        res.render('error', {error: err.message});
    };
});

// Sends the scores to the database after the game is finished
app.post('/highscores', (req, res) => {
    try {
        // Ensures score and name aren't null
        if (req.body.score === null || req.body.username === null) {
            console.error('Score or Userame is null.')
        };
        // const ip = req.ip
        db.run(
            // Inserts the values from the game into the database after the game is finished
            'INSERT INTO users (username, score) VALUES (?, ?)', 
            // Name and score are taken from the game and corrosponded to the ? marks in the sqlite insert
            [req.body.username, req.body.score], 
            // Console logs an error if one is found
            (err) => {
            if (err) {
                console.error(err)
            };
        });
        // Console logs an error if one is found
    } catch (err) {
        console.error(err);
    }
});

// Renders error.ejs
app.get('/error', (req, res) => {
    res.render('error');
});

// Listens to PORT and sends a message on whether it listened successfully 
app.listen(PORT, (err) => {
    // Console logs an error if one occurs
    if (err) {
        console.error(err.message);
    // Console logs that you're connected
    } else {
        console.log('Running on port ' + PORT);
    };
});