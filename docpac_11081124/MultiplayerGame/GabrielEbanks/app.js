const { json, text } = require('body-parser');
const { log } = require('console');
const express = require('express');
const app = express();
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 443 });

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('login'); // Renders the login view
});

app.get('/game', (req, res) => {
    if (req.query.username) {
        res.render('game', { name: req.query.username }); // Renders the game view
    } else {
        res.render('login'); // Renders the login view
    }
});


wss.on('connection', ws => {
    console.log('New client connected!')
    ws.send(JSON.stringify({ user: "server", message: 'connection established' }))
    ws.on('close', () => console.log('Client has disconnected!'))
    ws.onerror = function () {
        console.log('websocket error')
    }

})






const http = require('http').Server(app);
http.listen(3001, () => { console.log('Http listen server started on http://localhost:3001'); })