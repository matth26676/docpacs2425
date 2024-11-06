const { json, text } = require('body-parser');
const { log } = require('console');
const express = require('express')
const app = express()
const { v4:uuidv4} = require('uuid')

app.get('/', (req, res) => {
    res.sendFile(__dirname+'/index.html'); // Renders the index view
});

const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({ port: 443 })

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({id: ws.id}))
    ws.id = uuidv4()
    ws.on('message', (message) => {
        ws.send(JSON.stringify({user: 'Server', text: 'no u'}))
    })
})

app.listen(3000, () => {
    console.log('server is running on 300');
    
})