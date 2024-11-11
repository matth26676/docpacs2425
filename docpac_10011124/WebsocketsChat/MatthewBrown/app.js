const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {
    if (!req.query.localUser) {
        res.redirect('/');
    } else {
        const localUser = req.query.localUser;
        clients.push(localUser);
        res.render('chat', { localUser });
    }
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.name) {
            ws.name = parsedMessage.name;
            broadcast(wss, JSON.stringify(userList(wss)));
        }
        if (parsedMessage.text) {
            broadcast(wss, JSON.stringify({ user: ws.name, text: parsedMessage.text }));
        }
    });

    ws.on('close', () => {
        broadcast(wss, JSON.stringify(userList(wss)));
    });
});

function broadcast(wss, message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function userList(wss) {
    let userList = [];
    wss.clients.forEach(client => {
        if (client.name) {
            userList.push(client.name);
        }
    });
    return { list: userList };
}

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});