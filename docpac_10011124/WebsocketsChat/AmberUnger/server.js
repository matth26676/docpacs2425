const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

let users = require('./data.json').users;
let messages = [];

try {
    const messagesData = fs.readFileSync('./messages.json', 'utf8');
    messages = JSON.parse(messagesData).messages || [];
} catch (error) {
    console.error('Error reading messages.json:', error);
}

const connectedUsers = new Map();

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.redirect(`/chat?username=${encodeURIComponent(username)}`);
        } else {
            res.send('<script>alert("Username or password is incorrect"); window.location.href="/";</script>');
        }
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        fs.writeFileSync('./data.json', JSON.stringify({ users }, null, 2));
        res.redirect(`/chat?username=${encodeURIComponent(username)}`);
    }
});

app.get('/chat', (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.redirect('/');
    }
    res.render('chat', { username });
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'websocket-client.html'));
});

wss.on('connection', function connection(ws, req) {
    const params = new URLSearchParams(req.url.split('?')[1]);
    const username = params.get('username');
    if (username) {
        connectedUsers.set(username, ws);
        broadcastUserList();
        ws.send(JSON.stringify({ type: 'pastMessages', data: messages }));
        console.log(`User connected: ${username}`);

        const connectMessage = {
            type: 'system',
            data: `${username} has connected.`,
            timestamp: new Date().toISOString()
        };
        broadcastMessage(connectMessage);
    }

    ws.on('message', function message(message) {
        let data;
        try {
            data = JSON.parse(message);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return;
        }

        if (data.username === 'You') {
            data.username = username;
        }

        data.timestamp = new Date().toISOString();

        messages.push(data);
        fs.writeFileSync('./messages.json', JSON.stringify({ messages }, null, 2));

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });

        console.log(`Message received from ${username}: ${data.data}`);
    });

    ws.on('close', () => {
        if (username) {
            connectedUsers.delete(username);
            broadcastUserList();
            console.log(`User disconnected: ${username}`);

            const disconnectMessage = {
                type: 'system',
                data: `${username} has disconnected.`,
                timestamp: new Date().toISOString()
            };
            broadcastMessage(disconnectMessage);
        }
    });
});

function broadcastMessage(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

function broadcastUserList() {
    const userList = users.map(user => ({
        username: user.username,
        online: connectedUsers.has(user.username)
    }));
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'userList', data: userList }));
        }
    });
    console.log('User list broadcasted');
}

server.listen(3000, 'localhost', () => {
    console.log('Server is listening on port 3000');
});