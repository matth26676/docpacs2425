const express = require('express');
const app = express();

//WebSocket
const { WebSocketServer } = require('ws');
const http = require('http');
const { name } = require('ejs');
const { title } = require('process');
const wss = new WebSocketServer({ port: 443 });

const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//WebSocket connection
wss.on('connection', (ws) => {
    console.log(`New usser connected.`);

    ws.on('message', (message) => {
        message = message.toString('utf8');
        console.log(`WE GOT : ${message}`);
        if (message.text) {
            broadcast(wss, JSON.stringify({ user: ws.name, text: message.text }));
        };
    });
});

function broadcast(wss, message) {
    wss.clients.forEach((client) => {
        client.send(message);
    });
}

function userList() {
    let users = [];
    for (let client of wss.clients) {
        if (client.name) {
            users.push(client.name);
        };
    };
    return { list: users };
};

function nameCheck (req, res, next) {
    let name = req.query.name;
    //console.log(name);
    if (name) {
        next();
    } else {
        res.redirect('/');
    }
}

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

//App gets
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', nameCheck, (req, res) => {
    let name = req.query.name;
    res.render('chat', {title: 'Chat', name: name});
});

//App posts

const server = http.createServer(app);

//Start server
server.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});