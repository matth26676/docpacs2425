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
const messages = []
let name = ""

function userList(wss) {
    let users = []

    for (const client of wss.clients) {
        const name = client.name
        if (name) {
            users.push(name)}}
        return {list:users}}


function broadcast(wss, message) {
    for (const client of wss.clients){
        client.send(message)
    }
}

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
        return res.redirect('/');
    }
    else {
        res.render('chat')
    }
})

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        message = JSON.parse(message)
        if (message.text) {
            messages.push(`${message.name}: ${message.text}`)
            broadcast(wss, JSON.stringify({messages}))
        }
        else if (message.name) {
            ws.name = message.name
            broadcast(wss, JSON.stringify({names: userList(wss).list, messages}))
        }
    })

    ws.on("close", () => {
        var users = userList(wss)
        broadcast(wss, JSON.stringify({users}))
    })
})

//host webpage on port 3000
http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });
