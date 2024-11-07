//to install required modules, in terminal: "npm i express path http socket.io"

const express = require("express"); //import express
const app = express(); //initialize express with app

const path = require("path"); //import path

app.use(express.static("public")); //serve static files from "public" directory

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

let players = [];

io.on("connection", (socket) => { //on connection to socket.io server
    console.log(`User connected: ${socket.id}`);

    //check if there are already 2 players connected
    if (players.length >= 2) {
        socket.emit("gameFull"); //notify client the game is full
        socket.disconnect(); //disconnect the client
        return;
    };

    //assign playerID based on player count
    let playerID = players.length;
    players.push({ id: playerID, socket: socket });

    //send the playerID to the client
    socket.emit("playerID", { id: playerID });

    if (players.length === 2) {
        io.emit("gameStart");
    };

    //player movements synced on both connections
    socket.on("playerMove", (data) => {
        socket.broadcast.emit("playerMove", data);
    });

    //ball movements synced on both connections
    socket.on("ballMove", (data) => {
        socket.broadcast.emit("ballMove", data);
    });

    //player disconnects
    socket.on("disconnect", () => {
        console.log(`${socket.id} has disconnected.`);
        players = players.filter(player => player.socket !== socket);
        //game over when only one player left
        if (players.length === 1) {
            socket.emit("gameOver");
        };
    });
});

/*---------------
GET/POST Requests
---------------*/

//handle index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});