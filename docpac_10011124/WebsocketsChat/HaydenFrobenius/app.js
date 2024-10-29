const express = require('express');
const { join } = require('path');
const app = express();
const http = require('http').Server(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });
http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let clients = new Map();
let messages = [];

wss.on('connection', (socket) => {
    console.log('connection');
    socket.name = 'hi';

    
    for (let [client, name] of clients) {
        if (client.readyState === WebSocket.OPEN) {
            let data = {
                type: 'join',
                data: {name: name}
            };
            socket.send(JSON.stringify(data));
        }
    }

    messages.forEach(msg => {
        let data = {
            type: 'message',
            data: msg
        };
        socket.send(JSON.stringify(data));
    });

    socket.on('message', (message) => {
        let msg = JSON.parse(message);
        let data = msg.data

        console.log(msg);
        
        switch (msg.type){
            case 'message':
                messageSendHandler(socket, data.name, data.content);
                break;
            case 'join':
                joinHandler(socket, data.name);
                break;
        }

    });

    socket.on('close', () => {

        leaveHandler(socket, clients.get(socket));

    });
});

function messageSendHandler(socket, name, content) {

    let newMsg = {
        type: 'message',
        data: {name: name, content: content}
    }

    messages.push(newMsg.data);
    sendToAllClients(newMsg);
}

function joinHandler(socket, name) {

    clients.set(socket, name);

    let newMsg = {
        type: 'join',
        data: {name: name}
    }

    sendToAllClients(newMsg);
}

function leaveHandler(socket, name) {

    clients.delete(socket);

    let newMsg = {
        type: 'leave',
        data: {name: name}
    }

    sendToAllClients(newMsg);
}

function sendToAllClients(data){

    for (let [client, name] of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    }
}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {

    if (!req.query.name) {
        res.redirect('/');
        return;
    }

    res.render('chat', { name: req.query.name });
});