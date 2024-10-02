//Base setup thingys
const express = require('express');
const app = express();
const sql3 = require('sqlite3').verbose();
const PORT = 3000;

const maxLength = 15;
let name = req.body.name;
let score = req.body.score;

//Middleware for the db
express.use(express.json());

//thx co-piolet
var db = new sql3.Database('database.db');

//Server view ejs
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.get('/highscores', (req, res) => {
     try{
        //sqlite code to get score
        db.all('SELECT name, score FROM scores ORDER BY score DESC', (err, rows) => {
            if (err) {
                throw err;
            }

            rows.sort();
            rows.reverse();
            //How did co-piolet know I wanted this line?
            rows = rows.slice(0, 10);

            res.render('highscores', { scores: rows });
        });
     } catch (err) {
         res.render('error', { error: err});
     }
});

app.post('/highscores', (req, res) => {
    try{
        if (name.length > maxLength) {
            throw new Error(`Name is over ${maxLength} characters.`);
        } 
        
        if (score <= 0) {
            throw new Error('Score has to be over 0.');
        }

        let ip = req.ip;

        db.run('INSERT INTO scores (ip, name, score) VALUES (?, ?, ?)', [ip, name, score], (err) => {
            if (err) {
            throw err;
            }
            res.redirect('/highscores');
        });


    } catch (err) {
        res.render('error', { error: err });
    }
});

//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});