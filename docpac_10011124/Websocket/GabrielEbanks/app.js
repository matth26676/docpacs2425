const { json, text } = require('body-parser');
const { log } = require('console');
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 443 });

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const http = require('http').Server(app);
http.listen(3001, () => { console.log('Server started on http://localhost:3001'); });

app.get('/', (req, res) => {
    res.render('index'); // Renders the index view
});

app.get('/chat', (req, res) => {
    if (req.query.username) {
        res.render('chat', { name: req.query.username }); // Renders the chat view
    } else {
        res.render('index'); // Renders the index view
    }
});

console.log(wss);

function broadcast(wss, message) {
    for (const client of wss.clients) {
        client.send(JSON.stringify(message));
    }
}
let usernameList = []

function userList(wss) {

    for ( let client of wss.client) {
       if(client.name) {
       usernameList.push(client.name);
       }
       return {list:usernameList}
      }
}
console.log(usernameList)

// addEventListener("message", (event) => {
//     JSON.parse(message)
//     if (message.text) {

//     }
// });
