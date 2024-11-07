const { json, text } = require('body-parser');
const { log } = require('console');
const express = require('express');
const app = express();
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 443 });

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('game'); // Renders the game view
});

const http = require('http').Server(app);
http.listen(3001, () => { console.log('Server started on http://localhost:3001'); })