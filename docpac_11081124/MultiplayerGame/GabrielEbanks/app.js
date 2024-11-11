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

        if (message.type == 'scoreUpdate') {
            const username = message.username;
            const score = message.score
            console.log(score)
            console.log(scores)
            // make that individual users score be saved in the scores array
        }

        // if (message.type == 'endGame') {
        //     endGame();
        // }
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

// function endGame() {
//     gameStarted = false;

//     let winner = 

//     wss.clients.forEach(client => {
//         const username = message.username; {
//             if (username == winner) {
//                 client.send(JSON.stringify({ type: 'gameOver', result: 'You win' }));
//             } else {
//                 client.send(JSON.stringify({ type: 'gameOver', result: 'You lose' }));
//             }
//         }
//     });   
// }



const http = require('http').Server(app);
http.listen(3001, () => { console.log('Http listen server started on http://localhost:3001'); })