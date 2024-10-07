//importing sqlite3 module
const sqlite3 = require('sqlite3').verbose();

//starting my Express stuff
const express = require('express')
const app = express();
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));

/* For conviency I added my table with 9 entries already put
This is because you can check by adding an entry regularly and then
add an entry kicking off #10 and it wont take you 5 minutes to do(Game is 30 seconds)*/

//or you could just make the game 10 seconds long and do 10 entries in basically 2 min
let db = new sqlite3.Database('./scoreboard.db', (err) => {
    if (err) {
        console.error('Error making db:', err.message);
    } else {
        //Remember to get these from DBsqlite when performing a command to the db
        db.run(`CREATE TABLE IF NOT EXISTS scores (
            uid INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            name TEXT NOT NULL,
            score INTEGER NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error:', err.message);
            } else {
                console.log('Opened New Database');
            }
        });
    }
});

app.get('/', (req,res) => {
    res.render('index')
});

app.get('/game', (req, res) => {
    res.render('game')
});

app.post('/highScore', (req, res) =>{
    var name = req.body.name;
    var score = req.body.score;
    var ip = req.ip

    //making sure that names and scores aren't blank
    if (!name || !score){
        return res.render('error', { error: 'Name and score are required' });
    } 
    db.run(`INSERT INTO scores (ip, name, score) VALUES (?, ?, ?)`, [ip, name, score], (err) => {
        if (err) {
            return res.render('error', { error: err.message });
        }
        console.log(ip)
        console.log(name)
        console.log(score)
        res.redirect('/highScore');
    });
});

app.get('/highScore', (req, res) => {
    db.all("SELECT * FROM scores ORDER BY score DESC LIMIT 10", [], (err, rows) => {
        if (err) {
            return res.render('error', { error: err.message });
        }
        res.render('highScore', { scores: rows });
    });
});


app.listen(3000, (err) => {
    if (err) {
        console.log("failed connected")
    } else (
        console.log("Running on port 3000")
    )
});