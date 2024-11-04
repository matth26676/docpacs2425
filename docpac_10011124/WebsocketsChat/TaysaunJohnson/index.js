const { log } = require('console')
const express = require('express')
const webSocket = require('ws')
const app = express()
const http = require('http').Server(app)

app.set('view engine', 'ejs')

const wss = new webSocket.WebSocketServer({server: http})
console.log(wss.clients)

function broadcast(wss, message) {
    wss.clients.forEach(client => {
        client.send(JSON.stringify(message))
    });
}

function userList(wss) {
    var list = []
    wss.clients.forEach(client => {
        if (client.name) {
            list.push(client.name)
        }
    })
    return {list: list}
}

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        var message = JSON.parse(message)
        if (message.text) {
            broadcast(wss, message)
        }
        if (message.name) {
            ws.name = message.name
            broadcast(wss, userList(wss))
        }
    })
    ws.on('close', () => {
        broadcast(wss, userList(wss))
    })
})

app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/chat', (req, res) => {
    if (req.query.username) {
        res.render('chat', {name: req.query.username})
    } else {
        res.redirect('/')
    }
})

http.listen(3000, (err) => {
    if(err) {
        log(err)
    } else {
        log("Server listening on port 3000")
    }
})