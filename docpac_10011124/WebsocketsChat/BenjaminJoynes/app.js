const express = require('express');
const app = express();
const WebSocket = require('ws');
const http = require('http').Server(app);
const wss = new WebSocket.Server({ server: http });

http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('views', __dirname + '/views');

function broadcast(wss, message) {
    for (let client of wss.clients) {
        client.send(JSON.stringify(message));
    };
};

function userList(wss) {
    const users = [];
    wss.clients.forEach((client) => {
        if (client.hasOwnProperty('name')) {
            users.push(client.name);
        }
    });
    return { list: users };
};

function nameCheck(req, res, next) {
    let name = req.query.name;
    if (name) {
        next();
    } else {
        res.redirect('/');
    };
};

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', nameCheck, (req, res) => {
    const NAME = req.query.name;

    res.render('chat', { name: NAME });
});

app.get('/users', (req, res) => {
    res.json(userList(wss));
});

wss.on('connection', (ws) => {
    console.log(`someone joined the chat`);

    ws.on('message', (message) => {
        message = JSON.parse(String(message));

        if (message.hasOwnProperty('name')) {
            ws.name = message.name;
            broadcast(wss, { list: userList(wss).list });
        };

        if (message.hasOwnProperty('text')) {
            broadcast(wss, message);
        };
    });

    ws.on('close', () => {
        broadcast(wss, { list: userList(wss).list });
    });
});



