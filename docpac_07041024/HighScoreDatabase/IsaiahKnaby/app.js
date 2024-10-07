const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('index');
});

app.get("/", (req, res) => {
    res.render('game');
});

app.get("/", (req, res) => {
    res.render('highscore');
});

let db = new sqlite3.Database('data/basesOfData.db', (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Connected to the highscore database.");
    }
});

db.all(`SELECT * FROM cats INNER JOIN users ON users.uid = cats.owner WHERE color = ?;`, 'brown', (err, rows) =>{
    if (err) {
        console.error(err);
    } else {
        console.log(rows);
    }
} )

app.listen(PORT, console.log(`Server is running on port ${PORT}`));
