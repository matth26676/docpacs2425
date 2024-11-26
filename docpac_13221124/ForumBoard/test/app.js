const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Initialize SQLite database
const db = new sqlite3.Database('./forum.db');

// Middleware to parse POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // Set the template engine to ejs

// Home Route - Show all posts
app.get('/', (req, res) => {
    db.all('SELECT * FROM posts ORDER BY timestamp DESC', (err, rows) => {
        if (err) {
            return res.send("Error fetching posts.");
        }
        res.render('index', { posts: rows });
    });
});

// Post a new message
app.get('/new-post', (req, res) => {
    res.render('new-post');
});

app.post('/new-post', (req, res) => {
    const { title, content } = req.body;
    // Example hardcoded user_id for now
    const user_id = 1;  // Assuming the user with ID 1 is posting

    db.run('INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)', [title, content, user_id], function (err) {
        if (err) {
            return res.send("Error saving post.");
        }
        res.redirect('/');
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
