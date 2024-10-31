const express = require('express')
const path = require('path');
const WebSocket = require('ws');
const app = express();

const http = require('http').Server(app);
const wss = new WebSocket.Server({ server: http });
http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });

// On connection event listener
wss.on('connection', ws => {
    console.log('New client connected!')
    ws.on('close', () => console.log('Client has disconnected!'))
    // Broadcast a message to all clients
    ws.on('message', (message) => {
        message = JSON.parse(String(message))
        console.log('Message: ' + message)
        if (message.hasOwnProperty("text")) {
            console.log('text: ' + message.text)
            broadcast(wss, message)
        }
        if (message.hasOwnProperty("name")) {
            console.log('name: ' + message.name)
            wss.clients.forEach((client) => {
                if (client === ws) {
                    client.name = message.name
                }
            })
            // console.log('functioning')
            broadcast(wss, userList(wss))
        }
        console.log("")
    });
    ws.onerror = function () {
        console.log('websocket error')
    }
})

// Go through users and return a list of names
function userList(wss) {
    let users = []
    wss.clients.forEach((client) => {
        if (client.name) {
            users.push(client.name)
            // console.log('functioning')
        }
    })
    return { list: users }
}

// Broadcast a message to all clients
function broadcast(wss, message) {
    wss.clients.forEach((client) => {
        console.log(message)
        client.send(JSON.stringify(message))
    })
}

// Middleware to check if the name is provided
function checkName(req, res, next) {
    var name = req.query.name;
    if (name) {
        next();
    } else {
        res.redirect('/');
    }
}

app.use(express.urlencoded({ extended: true }));

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));


// Define a route
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to Express with EJS' });
});

app.get('/chat', checkName, (req, res) => {
    var name = req.query.name;
    res.render('chat', { title: 'Welcome to Express with EJS', name });
});