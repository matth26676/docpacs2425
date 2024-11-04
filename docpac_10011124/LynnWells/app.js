const port = 3000
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const http = require('http').Server(app);
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server: http });
// const bc = new BroadcastChannel('chatChannel')

let name = ""

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('index')//, { user: req.session.user });
    name = JSON.stringify(req.body.name)
    console.log(name)
})

app.get('/chat', (req, res) => {
    const name = req.query.name;
    if (!name) {
        return res.redirect('/');}
    else {
    res.render('chat')
}})

app.post('/', (req, res) => {
    console.log(req.body.name)
    
})

function broadcast(wss, message) {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Example: Broadcast a message to all clients
    broadcast(wss, 'Welcome new client!');

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Optionally, broadcast the received message to all clients
        broadcast(wss, message);
    });
});

function userList(wss) {
    let userList = []

    wss.clients.forEach(client => {
        if (client.name) {
            userList.push(client.name)
        }})
        return {list: userList}
}

// bc.postMessage("This is a test message.");

// bc.onmessage = (event) => {
//     console.log(event);
//   };

// //host websockets on port 443
// const { WebSocketServer } = require('ws');
// const { name } = require('ejs');
// const wss = new WebSocketServer({ port: 443 })

// //Lest you at least see me for myself
// wss.on('connection', (ws) => {
//     ws.id = uuidv4()
//     ws.send(JSON.stringify({ id: ws.id }))
//     ws.on('message', (message => {
//         //console.log(JSON.parse(message)) //IT DON'T WORK, USING STRINGIFY SENDS A BUFFER
//         ws.send(JSON.stringify({ user: "Server", text: "Hi, we're ready to take your order!" }))
//     }))
// })

//host webpage on port 3000
http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });
