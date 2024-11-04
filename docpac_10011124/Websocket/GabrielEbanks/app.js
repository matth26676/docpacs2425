const { json, text } = require('body-parser');
const { log } = require('console');
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 443 });

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const http = require('http').Server(app);
http.listen(3001, () => { console.log('Server started on http://localhost:3001'); });

app.get('/', (req, res) => {
    res.render('index'); // Renders the index view
});

app.get('/chat', (req, res) => {
    if (req.query.username) {
        res.render('chat', { name: req.query.username }); // Renders the chat view
    } else {
        res.render('index'); // Renders the index view
    }
});


function broadcast(wsserver, messageToSend) {

    for (const client of wsserver.clients) {

        client.send(JSON.stringify(messageToSend));
    }
}
let usernameList = []

function userList(wss) {

    for (let client of wss.client) {
        if (client.name) {
            usernameList.push(client.name);
        }
        return { list: usernameList }
    }
}
console.log(usernameList)



wss.on('connection', ws => {
    console.log('New client connected!')
    ws.send(JSON.stringify({user: "server" ,message:'connection established'}))
    ws.on('close', () => console.log('Client has disconnected!'))
    ws.on('message', data => {
        data= JSON.parse(data);
        console.log(data);
        
        
        
        broadcast(wss, data)
    })
    ws.onerror = function () {
        console.log('websocket error')
    }
})