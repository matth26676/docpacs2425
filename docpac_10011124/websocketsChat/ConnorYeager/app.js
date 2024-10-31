const express = require('express');
const app = express();
const http = require('http').Server(app);
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server: http });
const { v4: uuidv4 } = require('uuid');
const clients = new Map();

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

function broadcast(ws, message) {
    
};

wss.on('connection', (ws) => {
    const id = uuidv4();
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {
    res.render('chat');
})

http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });