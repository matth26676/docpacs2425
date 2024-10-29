const express = require('express')
const app = express()
const PORT = 3000;
const sqlite3 = require('sqlite3');

const http = require('http').Server(app);
const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({ port: 443 })

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static('public'));

wss.on('connection', ws => {
    console.log('New client connected!');
    ws.send('connection established');
    ws.on('close', () => console.log('Client has disconnected!'));
    ws.on('message', data => {
        sockserver.clients.forEach(client => {
            console.log(`distributing message: ${data}`);
            client.send(`${data}`);
        });
    });
    ws.onerror = function () {
        console.log('websocket error')
    };
});

function usserHere(req, res, next) {
    let name = req.query.name;
    if (name) {
        console.log('all good');
        next();
    } else {
        console.log('Redirecting');
        res.redirect('/');
    }
}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', usserHere, (req, res) => {
    res.render('chat');
});

http.listen(PORT, () => { console.log(`Server started on http://localhost:3000`); });