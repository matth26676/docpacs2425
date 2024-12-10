const express = require("express");
const ws = require("ws");

// Setup http and websocket server
const app = express();
const http = require("http").Server(app);
const wss = new ws.WebSocketServer({ server: http });
app.use(express.static(__dirname + "/img"));
app.set("view engine", "ejs");

// Hold information about the game
const players = {};
const canvasSize = { w: 800, h: 600 };
const coinSize = { w: 32, h: 32 };
let coinPosition = generateCoinPosition();
let timer = 60;
let gameOver = false;

// Broadcasts a JSON object to all players
function broadcast(message) {
    const stringifiedMessage = JSON.stringify(message);
    for (const playerName in players) {
        const player = players[playerName];
        player.send(stringifiedMessage);
    }
}

function generateCoinPosition() {
    const x = Math.floor(Math.random() * (canvasSize.w - coinSize.w));
    const y = Math.floor(Math.random() * (canvasSize.h - coinSize.h));
    return { x, y };
}

function generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return { r, g, b };
}

app.get("/", (req, res) => {
    res.render("index");
});

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        try {
            message = JSON.parse(message);

            switch (message.type) {
                case "connection": {
                    // Ensure that the name is not already in use by someone else
                    const name = message.name;
                    if (players[name]) {
                        ws.terminate()
                    }
                    
                    // Setup player information
                    ws.name = name;
                    ws.coins = 0;
                    ws.position = { x: 20, y: 20 }
                    ws.size = { w: 64, h: 64 }
                    ws.color = generateRandomColor();
                    ws.keysPressed = {
                        w: false,
                        a: false,
                        s: false,
                        d: false
                    };

                    // Add the player's websocket connection to the players dictionary
                    players[name] = ws;
                    
                    // Send the current players to the joining player
                    ws.send(JSON.stringify({
                        type: "currentPlayers",
                        players,
                        ws
                    }))

                    // Send the joining player to everyone
                    broadcast({
                        type: "playerJoin",
                        ws
                    });

                    // Send the current coin position to everyone
                    broadcast({
                        type: "coinPositionUpdate",
                        coinPosition
                    });

                    console.log(`${name} connected to the server!`);
                    break;
                }

                case "keyPressed": {
                    ws.keysPressed[message.key] = true;
                    break;
                }

                case "keyReleased": {
                    ws.keysPressed[message.key] = false;
                    break;
                }
            }
        } catch {}; // Prevent someone from crashing the server by sending malformed data
    });

    ws.on("close", () => {
        // Remove the player's websocket conneciton from the players dictionary
        delete players[ws.name];
        broadcast({
            type: "playerLeave",
            ws
        });
    });
});

const playerSpeed = 10;
function gameLoop() {
    for (const playerName in players) {
        const player = players[playerName];
        const directionX = player.keysPressed["d"] - player.keysPressed["a"];
        const directionY = player.keysPressed["s"] - player.keysPressed["w"];

        // Calculate the player's new position & prevent them from going faster when moving diagonally
        const length = Math.sqrt(directionX * directionX + directionY * directionY);
        let newX = length ? (directionX / length) * playerSpeed : 0;
        let newY = length ? (directionY / length) * playerSpeed : 0;

        // Check if newX is past canvas bounds
        if (player.position.x + newX < 0 || player.position.x + newX + player.size.w > canvasSize.w) {
            newX = 0;
        }

        // Check if newY is past canvas bounds
        if (player.position.y + newY < 0 || player.position.y + newY + player.size.h > canvasSize.h) {
            newY = 0;
        }

        // Update player position if it has changed
        if (newX !== 0 || newY !== 0) {
            player.position.x += newX;
            player.position.y += newY;

            // Send the updated position to all players
            broadcast({
                type: "playerPositionUpdate",
                ws: player
            });
        }

        // If the game is over, do not handle collision
        if (gameOver) {
            return;
        }

        // Check for coin collision
        const playerLeft = player.position.x;
        const playerRight = player.position.x + player.size.w;
        const playerTop = player.position.y;
        const playerBottom = player.position.y + player.size.h;

        const coinLeft = coinPosition.x;
        const coinRight = coinPosition.x + coinSize.w;
        const coinTop = coinPosition.y;
        const coinBottom = coinPosition.y + coinSize.h;

        if (playerRight > coinLeft && playerLeft < coinRight && playerBottom > coinTop && playerTop < coinBottom) {
            player.coins += 1;
            coinPosition = generateCoinPosition();
            broadcast({
                type: "coinPositionUpdate",
                coinPosition
            });

            // Alert clients that the coin has been collected
            broadcast({
                type: "coinCollected",
                name: player.name,
                coinPosition
            });
        }
    }
}

// Run game loop at 60 fps
setInterval(gameLoop, 1000 / 60);

// Decrease the timer by one every second
setInterval(() => {
    timer--;
    if (timer >= 0) {
        broadcast({
            type: "timerUpdate",
            timer
        })
    } else {
        // Get the player with the most coins
        let winner = "";
        let lastCoinAmount = 0;
        for (const playerName in players) {
            const player = players[playerName];
            if (player.coins > lastCoinAmount) {
                lastCoinAmount = player.coins;
                winner = player.name;        
            }
        }

        gameOver = true;
        broadcast({ type: "gameOver", winner });
        clearInterval(this);
    }
}, 1000);

http.listen(3000);
