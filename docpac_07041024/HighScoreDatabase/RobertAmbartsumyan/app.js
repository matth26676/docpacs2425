const express = require('express');
const app = express();
const sql3 = require('sqlite3').verbose();
const PORT = 3000;

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
    res.render('hiscores');
});

app.post('/highscores', (req, res) => {
    try{
        

        


    } catch (err) {
        res.render('error', { error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});