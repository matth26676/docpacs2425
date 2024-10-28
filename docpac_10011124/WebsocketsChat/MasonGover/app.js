const express = require("express");
const ws = require("ws");

const app = express();
const http = require("http").Server(app);
const wss = new WebSocket.Server({ server: http });
app.set("view engine", "ejs");

function broadcast(wss, message) {
    for (const client of wss.clients) {
        ws.send(message);
    }
}

function userList(wss) {
    const users = [];
    for (const client of wss.clients) {
        const name = client.name;
        if (name) {
            users.append(name);
        }
    }
}

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/chat", (req, res) => {
    const name = req.query.name;
    if (!name) {
        return res.redirect("/");
    }

    res.render("chat", { username: name });
});

wss.on("connection", () => {

});

http.listen(3000, () => {
    console.log("Server is running on port 3000");
});