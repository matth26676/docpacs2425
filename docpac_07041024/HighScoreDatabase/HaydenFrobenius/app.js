const express = require('express');
const sql = require('sqlite3').verbose();
const app = express();

let db = new sql.Database("./database.db");

const PORT = 3000;

const maxNameLength = 30;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(PORT);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.get('/hiscores', (req, res) => {
    try {
        db.all("SELECT * FROM scores", (err, rows) => {
            if(err) throw err;
            rows.sort();
            rows.reverse();
            //The docpac says to use splice and I am using slice instead. I am very sorry, yet I am not sorry at all. I'm lying. I'm not practicing York Tech Integrity. Send me to the dungeon!
            rows = rows.slice(0, 10);

            res.render('hiscores', {scores: rows});

        });

    } catch(err) {
        res.render('error', {error: err.message});
    }
});

app.post('/hiscores', (req, res) => {
    console.log(req.body);
    try {
        if(!req.body?.name) throw new Error("Name Required");
        if(!req.body?.score) throw new Error("Score Required");
        
        let ip = req.socket.remoteAddress;
        let name = req.body.name;
        let score = req.body.score;

        if(name > maxNameLength) throw new Error(`Invalid Name Length (Max is ${maxNameLength})`);
        if(score < 0) throw new Error("Score cannot be less than zero (skill issue)");

        db.run("INSERT INTO scores (ip, name, score) VALUES (?, ?, ?)", [ip, name, score], (err) => {
            if(err) throw err;
        });

        res.status(200)

    } catch (err) {
        res.render('error', {error: err.message}); // This doesn't even work when sending request from clientside js, but you gotta build to spec!
    }
});