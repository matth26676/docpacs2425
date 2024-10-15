const express = require('express');
const path = require('path');

const app = express();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(path.join(__dirname, 'HIGHSCORE.db'), (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index', {});
});

app.get('/highscores', (req, res) => {
    db.all('SELECT * FROM scores ORDER BY score DESC LIMIT 10', (err, rows) => {
        if (err) {
            res.render('error', { error: err });
        } else {
            res.render('highscores', { scores: rows });
        }
    });
});

app.get('/game', (req, res) => {
    res.render('game', {});
});

app.post('/highscores', (req, res) => {
    // Handle the submission of a high score
    var ip = "sql injection detected";
    // Detect for SQL Injection
    if (req.body.name.includes("DROP TABLE") || req.body.name.includes("DELETE") || req.body.name.includes("UPDATE") || req.body.name.includes("INSERT")
        || req.body.name.includes("SELECT") || req.body.name.includes("ALTER") || req.body.name.includes("CREATE") || req.body.name.includes("DROP") || req.body.name.includes("TRUNCATE")) {
        if (req.body.score.includes("DROP TABLE") || req.body.score.includes("DELETE") || req.body.score.includes("UPDATE") || req.body.score.includes("INSERT")
            || req.body.score.includes("SELECT") || req.body.score.includes("ALTER") || req.body.score.includes("CREATE") || req.body.score.includes("DROP") || req.body.score.includes("TRUNCATE")) {
            console.log("Error in username or score");
            return;
        }
    } else {
        ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        db.run('INSERT INTO scores (name, score, ip) VALUES (?, ?, ?)', [req.body.name, req.body.score, ip], (err) => {
            if (err) {
                console.log(err);
            }
        });
    }
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});