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



    socket.on('message', (message) => {
        let msg = JSON.parse(String(message));
        
        if(msg.hasOwnProperty('text')){
            broadcast(wss, msg);
        }

        if(msg.hasOwnProperty('name')){
            socket.name = msg.name;
            broadcast(wss, userList(wss));
        }

    });

    socket.on('close', () => {

        broadcast(wss, userList(wss));

    });
});

function broadcast(wss, message){
    console.log(message)
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(message));
    });
}

function userList(wss){
    let list = [];
    wss.clients.forEach((client, index) => {
        if(client.hasOwnProperty('name')){
            list.push(client);
        }
    });

    return {list: list};
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