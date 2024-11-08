const express = require("express");
const ws = require("ws");

const app = express();
const http = require("http").Server(app);
const wss = new ws.WebSocketServer({ server: http });
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
});

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        try {
            message = JSON.parse(message);

            if (message.type == "connection") {
                ws.movingDirection = "none"; // up, down, left, right
                ws.coins = 0;
                console.log(`${message.name} connected to the server!`);
            }

            if (message.type == "movement") {
                // @TODO: do all of this
            }
        } catch {}; // Prevent someone from crashing the server by sending malformed data
    });

    ws.on("close", () => {
        // @TODO: Handle closing player connection
    });
});

http.listen(3000);