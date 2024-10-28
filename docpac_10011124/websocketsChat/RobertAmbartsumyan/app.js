const { name } = require('ejs');
const express = require('express');
const PORT = 3000;
const app = express();
const sqlite3 = require('sqlite3');
const http = require('http').Server(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.error('Database opening error: ', err);
    } else {
        console.log('Database opened');
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {
    res.render('chat');
    let name = req.query.name;
    console.log(name);
});

http.listen(PORT, () => { console.log(`Server started on http://localhost:3000`); });