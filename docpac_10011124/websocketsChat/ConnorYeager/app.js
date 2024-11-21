const express = require("express");
const ws = require("ws");

const app = express();
const http = require("http").Server(app);
const wss = new ws.WebSocketServer({ server: http });
const messages = [];
app.set("view engine", "ejs");

function broadcast(wss, message) {
    for (const client of wss.clients) {
        client.send(message);
    }
}

function userList(wss) {
    const users = [];
    for (const client of wss.clients) {
        const name = client.name;
        if (name) {
            users.push(name);
        }
    }
    
    return {
        list: users
    };
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

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        message = JSON.parse(message);
        if (message.name) {
            ws.name = message.name;
            broadcast(wss, JSON.stringify({
                names: userList(wss).list,
                messages
            }));
        }

        if (message.text) {
            messages.push(`${message.name}: ${message.text}`);
            broadcast(wss, JSON.stringify({ messages }));
        }
    });

    ws.on("close", () => {
        let users = userList(wss).list;
        broadcast(wss, JSON.stringify({ names: users }));
    });
});

http.listen(3000, () => {
    console.log("Server is running on port 3000");
});