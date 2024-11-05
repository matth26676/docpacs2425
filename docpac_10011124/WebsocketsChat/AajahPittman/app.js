const { log } = require('console');
const express = require('express');
const { appendFile } = require('fs');
const app = express();
const http = require('http').Server(app);
const ws = require('ws');
const wss = new ws.WebSocketServer({ server: http });
http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {
    if (req.query.name) {
        res.render('chat', { user: req.query.name })
    } else (
        res.redirect('/')
    )
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));



function broadcast(wss, message) {
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(message))
    })
}


function userList(wss) {
    var userList = []
    wss.clients.forEach((client) => {
        if (client.name) {
            userList.push(client.name);
        }
    })
    return { list: userList };
}

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        message = JSON.parse(message)
        console.log(message);

        if (message.text) {
            broadcast(wss, message)
        } 
        if (message.name) {
            ws.name = message.name;
            broadcast(wss, userList(wss));
        }
    })
    ws.on('close', (close) => {
        broadcast(ws, userList(wss))
    })
})

