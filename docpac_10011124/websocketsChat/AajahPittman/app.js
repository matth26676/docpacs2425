const express = require('express');
const ws = require('ws');
const app = express();
const http = require('http').Server(app);
const wss = new ws.WebSocketServer({ server: http });
http.listen(3000, () => { console.log(`Server started on http://localhost:3000`); });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/chat', (req, res) => {
    res.render('chat');
});

app.get('/chat', (req, res) => {
    res.render('/chat', { user: req.query.user })
});

