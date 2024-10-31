//to install required modules, in terminal: "npm i express ejs ws http"

const express = require("express"); //import express
const app = express(); //initialize express with app

const ejs = require("ejs"); //import ejs

app.set("view engine", "ejs"); // set view engine
app.use(express.urlencoded({ extended: true })); //encode url

/*---------
HTTP Server
---------*/

const http = require('http').Server(app); //import http, create http server, and associate it with express

const PORT = process.env.PORT || 1000; //change port number from default
http.listen(PORT, console.log(`Server started on port ${PORT}`)); //start http server, listen on given port

/*--------------
WebSocket Server
--------------*/

const WebSocket = require("ws"); //import WebSocket
const wss = new WebSocket.Server({server: http}); //create new WebSocket server, attach it to http server

wss.client.name = document.getElementById("name").innerHTML
ws.send(JSON.stringify({name: ws.name}));

wss.on("connection", (ws => { //on connection to WebSocket server
    ws.on("close", () => console.log(`${ws.name} has disconnected.`));

    function broadcast(wss, message) => {
        let message = document.getElementById("message").innerHTML
        ws.send(JSON.stringify({message: ws.message}));
    };

    function userList(wss) => {
        let userList = [];
        array.forEach(wss.client => {
            if (client.name) {
                userList.push(client.name)
            }
            return users.list = userList
        });
    };
}));


/*---------------
GET/POST Requests
---------------*/

//handle index
app.get("/", (req, res) => {
    res.render("index");
});

app.post("/index", (req, res) => {

});

//handle chat
app.get("/chat", (req, res) => {
    try {
        res.render("chat", { user: req.query.user });
    } catch (error) {
        res.send(error.message);
    }
});