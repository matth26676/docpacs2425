const express = require("express");
const http = require("http");
const WebSocket = require('ws');
const db = require('./database/database');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Make sure to change this IP address to your local machine's IP address
const localMachineIP = '192.???.???.?';

// use your own local machine IP address starting with '172' if you want other devices to connect to your server
// const localMachineIP = '172.??.?.???';

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    if (!req.query.localUser) {
        res.redirect('/');
    } else {
        const localUser = req.query.localUser;
        db.get(`SELECT * FROM users WHERE name = ?`, [localUser], (err, row) => {
            if (err) {
                return console.log(err.message);
            }
            if (row) {
                // User already exists, proceed to game page
                res.render('game', { localUser, localMachineIP });
            } else {
                // Insert new user
                db.run(`INSERT INTO users (name) VALUES (?)`, [localUser], function(err) {
                    if (err) {
                        return console.log(err.message);
                    }
                    res.render('game', { localUser, localMachineIP });
                });
            }
        });
    }
});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage && parsedMessage.name && parsedMessage.score) {
            db.run(`UPDATE users SET clicks = clicks + ? WHERE name = ?`, [parsedMessage.score, parsedMessage.name], function(err) {
                if (err) {
                    return console.log(err.message);
                }
                db.get(`SELECT SUM(clicks) AS totalClicks FROM users`, (err, row) => {
                    if (err) {
                        return console.log(err.message);
                    }
                    broadcast(wss, JSON.stringify({ totalClicks: row.totalClicks }));
                });
                updateLeaderboard(wss);
            });
        } else if (parsedMessage.requestUserRank) {
            db.get(`SELECT name, clicks, (SELECT COUNT(*) FROM users WHERE clicks > u.clicks) + 1 AS rank FROM users u WHERE name = ?`, [parsedMessage.requestUserRank], (err, row) => {
                if (err) {
                    return console.log(err.message);
                }
                ws.send(JSON.stringify({ userRank: row }));
            });
        }
    });
});

function broadcast(wss, message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function updateLeaderboard(wss) {
    db.all(`SELECT name, clicks FROM users ORDER BY clicks DESC LIMIT 15`, (err, rows) => {
        if (err) {
            return console.log(err.message);
        }
        const leaderboard = rows;
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ leaderboard }));
            }
        });
    });
}

server.listen(3000, localMachineIP, () => {
    console.log(`Server is running on http://${localMachineIP}:3000`);
});