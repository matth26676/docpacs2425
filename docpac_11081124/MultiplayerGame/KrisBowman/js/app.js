//to install required modules, in terminal: "npm i express path http socket.io"

const express = require("express"); //import express
const app = express(); //initialize express with app

const path = require("path")

app.use(express.static("/public")); //serve static files from "public" directory

/*---------
HTTP Server
---------*/

const http = require('http').Server(app); //import http, create http server and associate it with express

const PORT = process.env.PORT || 6473; //change port number from default
http.listen(PORT, console.log(`Server started on port ${PORT}`)); //start http server, listen on given port

/*--------------
socket.io Server
--------------*/

const { Server } = require("socket.io");
const io = new Server(http); //create new socket.io server, attach it to http server

io.on("connection", (socket) => { //on connection to socket.io server
    console.log(`User connected: ${socket.id}`);

    socket.on("paddleMove", (data) => { //paddle movements synced on both connections
        socket.broadcast.emit("paddleMove", data);
    });

    socket.on("ballMove", (data) => { //ball movements synced on both connections
        socket.broadcast.emit("ballMove", data);
    });
    io.on("close", () => {
        ; //player disconnects
        console.log(`${socket.id} has disconnected.`);
    });
});

/*---------------
GET/POST Requests
---------------*/

//handle index
app.get('/', (req, res) => {
    res.sendFile("index.html")
});