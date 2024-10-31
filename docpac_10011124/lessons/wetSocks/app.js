const express = require("express");
const app = express();
const {v4: uuidv4} = require("uuid");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const webSocket = require("ws"); //add webSocket
const wss = new webSocket.Server({port: 443}); //create new WebSocket server

wss.on("connection", (ws) => {
    ws.id = uuidv4();
    ws.send(JSON.stringify({id: ws.id}));
    ws.on("message", (message) => {
        ws.send(JSON.stringify({user: "Server", text: "no u"}));
    });
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000"); //server setup
});