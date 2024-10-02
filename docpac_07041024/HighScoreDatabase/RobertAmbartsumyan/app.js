//Base setup thingys
const express = require('express');
const app = express();
const sql3 = require('sqlite3').verbose();
const PORT = 3000;

//Middleware for the db
app.use(express.json());

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

app.get('/hiscores', (req, res) => {
     try{
        //sqlite code to get score
        db.all('SELECT name, score FROM scores ORDER BY score DESC', (err, rows) => {
            if (err) {
                throw err;
            }

            rows.sort();
            rows.reverse();
            //How did co-piolet know I wanted this line?
            rows = rows.splice(0, 10);

            res.render('hiscores', { scores: rows });
        });
     } catch (err) {
         res.render('error', { error: err});
     }
});

app.post('/hiscores', (req, res) => {
    try{
        
        let name = req.body.name;
        let score = req.body.score;
        let tooLong = 15;
        //console.log(name);
        //console.log(score);

        if (name.length <= 0) {
            throw new Error(`Name does not exist. ummm be better`);
        } 
        //console.log(name);

        if (name.length > tooLong) {
            throw new Error(`Name is too long. keep it under ${tooLong} silly.`);
        }
        
        if (score <= 0) {
            throw new Error('Score has to be over 0.');
        }
        
        //console.log(score);

        let ip = req.ip;
        //console.log(ip);

        db.run('INSERT INTO scores (ip, name, score) VALUES (?, ?, ?)', [ip, name, score], (err) => {
            if (err) {throw err}
        });
        //console.log('done');

        res.status(300)


    } catch (err) {
        res.render('error', { error: err});
    }
});

//Start the server
app.listen(PORT, () => {
    console.log(`Server on http://localhost:${PORT}`);
});