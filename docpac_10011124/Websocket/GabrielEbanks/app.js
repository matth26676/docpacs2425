const { json, text } = require('body-parser');
const { log } = require('console');
const express = require('express')
const app = express()
const { v4:uuidv4} = require('uuid')
const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({ port: 443 })

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))

const http = require('http').Server(app);
http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });


app.get('/', (req, res) => {
    res.render('index'); // Renders the index view
    
});


app.get('/chat', (req, res) => {
    if (req.query.username) {
        res.render('chat', {name: req.query.username}); // Renders the index view
    } else {
        res.render('index'); // Renders the index view
    }
});

function broadcast (wss,message) {
    
}




























// Start the Express server on port 3000
app.listen(3000, () => {
    console.log(`Server started on port 3000`); // Log confirmation message
});
