const express = require('express');
const app = express();
const http = require('http').Server(app);
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ server: http });
const { v4: uuidv4 } = require('uuid');
let clients = new Map();
let messages = [];

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

function broadcast(ws, message) {
    console.log(message)
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(message));
    });
};
function userList(wss){
    let list = [];
    wss.clients.forEach((client, index) => {
        if(client.hasOwnProperty('name')){
            list.push(client);
        }
    });

    return {list: list};
}

wss.on('connection', (ws) => {
    const id = uuidv4();
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {
    if (!req.query.name) {
        res.redirect('/');
        return;
    }

    res.render('chat', { name: req.query.name });
})

http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });