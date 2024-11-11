const { name } = require('ejs')
const express = require('express')
const app = express()
const { v4: uuidv4 } = require('uuid')

app.set('view engine', "ejs")

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/chat', (req, res) => {
    if (req.query.name) {
        res.render('chat', { username: req.query.name })
    } else {
        res.redirect('/')
    }
})

const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({ port: 443 })

wss.on('connection', ws => {
    ws.send(JSON.stringify({ name: "Server", text: "Hello and welcome to the server!" }))
    ws.on('message', (message) => {
        message = JSON.parse(message)
        if (message.name) {
            ws.name = message.name
            if (!message.text) {
                broadcast(wss, {name: "Server", text: ws.name+" has connected!"})
            }
            broadcast(wss, {list: userList(wss)})
        }
        if (message.text) {
            broadcast(wss, message)
            
            
        }
        if (message.name) {
            ws.name = message.name
        }
    })
    ws.on('close', ws => {
        broadcast(wss, {name: "Server", text: "A user has disconnected!"})
        broadcast(wss, {list: userList(wss)})
        
    })
});


app.listen(3000, () => {
    console.log(`Listening on ${3000}`)
});

function broadcast(wss, message) {
    for (client of wss.clients) {
        client.send(JSON.stringify(message))
    };
}

function userList(wss) {
    var userlist = []
    for (client of wss.clients) {
        if (client.name) {
            userlist.push(client.name)
        }
    }
    return userlist
}