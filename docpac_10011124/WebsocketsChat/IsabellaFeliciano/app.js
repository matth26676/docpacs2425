// importing required modules
const express = require('express');
const app = express();
const http = require('http').Server(app);
const ws = require('ws');
const wss = new ws.WebSocketServer({ server: http });

http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });

// setting up routes
app.get('/', (req, res) => {
    res.render('index');
});

// chat route
app.get('/chat', (req, res) => {
    if (req.query.name) {
        res.render('chat', { user: req.query.name })
    } else (
        res.redirect('/')
    )
});

// setting up view engine
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


function broadcast(wss, message) {
    console.log(message)
    // Send the message to all connected clients
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(message));
    });
}

// Generate a list of usernames of connected clients
function userList(wss) {
    const userList = [];
    for (const client of wss.clients) {
        if (client.name) {
            userList.push(client.name);
        }
    }
    return { list: userList };
}

// WebSocket connection
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.text) {
            broadcast(wss, parsedMessage);
        }

        if (parsedMessage.name) {
            ws.name = parsedMessage.name;
            broadcast(wss, userList(wss));
        }
    });

    ws.on('close', () => {
        broadcast(wss, userList(wss));
    });
});