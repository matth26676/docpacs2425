const sqlite3 = require('sqlite3').verbose();
const express = require ('express')
const app = express();

const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.json());

let db = new sqlite3.Database('data/buttonMashBase.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Database on, It worky")
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.get('/highscore', (req, res) => {
    try {
        db.all('SELECT * FROM users ORDER BY score DESC', (err, rows) => {
            if (err) {
                console.error(err.message);
            };
            rows = rows.slice(0, 10);
            res.render('highscore', {users: rows});
        });
    } catch (err) {
        res.render('error', {error: err.message});
    }
});

app.post('/highscore', (req, res) => {
    try {
        if (req.body.score === null || req.body.username === null) {
            console.error('You dont exist or dont have a score')
        };
        db.run(
            'INSERT INTO users (ip, username, score) VALUES (?, ?, ?)',
            [req.ip, req.body.username, req.body.score],
            (err) => {
                if (err) {
                    console.error(err)
                };
            }
        );
    } catch (err) {
        console.error(err);
    }
});



app.listen(PORT);