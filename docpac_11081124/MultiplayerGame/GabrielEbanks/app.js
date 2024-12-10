const { json, text } = require('body-parser');
const { log } = require('console');
const express = require('express');
const app = express();
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 443 });
let clients = new Map();
let scores = []
let gameStarted = false;



app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('login'); // Renders the login view
});

app.get('/game', (req, res) => {
    if (req.query.username) {
        res.render('game', { name: req.query.username }); // Renders the game view
    } else {
        res.render('login'); // Renders the login view
    }
});




wss.on('connection', (ws) => {
    console.log('New client connected!');
    ws.send(JSON.stringify({ user: "server", message: 'connection established' }));
    ws.onerror = () => {
        console.log('WebSocket error');
    };
    ws.on('message', (data) => {
        const message = JSON.parse(data);

        if (message.type == 'playerUsername') {
            const username = message.username;
            clients.set(ws, username);
            console.log(`${username} connected`);
        }

        if (message.type === 'startGame' && !gameStarted) {
            gameStarted = true;
            broadcast({ type: 'startCountdown', timeLeft: 20 });
        }

        if (message.type === 'scoreUpdate') {
            const username = message.username;
            const score = message.score
            console.log(username, score)
            const userIndex = scores.findIndex(entry => entry.username === username);

            if (userIndex !== -1) {
                scores[userIndex].score = score;
            } else { 
                scores.push({ username: username, score: score });
            }
            console.log(scores) 
        }

        if (message.type == 'endGame') {
            endGame();
        }
    });

    ws.on('close', () => {
        const username = clients.get(ws);
        console.log(`${username} disconnected`);
        clients.delete(ws);
    });
});


function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}


function endGame() {
    gameStarted = false;

    
    let winner = scores[0]; 
    if (scores.length > 1 && scores[0].score === scores[1].score) {
        winner = 'tie'; 
    } else {
        for (let i = 1; i < scores.length; i++) {
            if (scores[i].score > winner.score) {
                winner = scores[i];
            }
        }
    }
    
    wss.clients.forEach(client => {
        const username = clients.get(client);
        if (!username) {
            console.log("Username not found.");
        }
        if (winner === 'tie') {
            client.send(JSON.stringify({ type: 'gameOver', result: 'You tied' }));
        } else if (username === winner.username) {
            client.send(JSON.stringify({ type: 'gameOver', result: 'You win' }));
        } else {
            client.send(JSON.stringify({ type: 'gameOver', result: 'You lose' }));
        }
    });
}




const http = require('http').Server(app);
http.listen(3001, () => { console.log('Http listen server started on http://localhost:3001'); })