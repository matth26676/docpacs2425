//to install required modules, in terminal: "npm i express path http socket.io"

const express = require("express"); //import express
const app = express(); //initialize express with app

const path = require("path"); //import path

app.use(express.static("public")); //serve static files from "public" directory

/*---------
HTTP Server
---------*/

const http = require('http').Server(app); //import http, create http server and associate it with express

const PORT = process.env.PORT || 3000; //change port number from default
http.listen(PORT, console.log(`Server started on port ${PORT}`)); //start http server, listen on given port

/*--------------
Default settings
--------------*/

//players
let players = [];

//canvas
const canvasWidth = 800;
const canvasHeight = 600;

//ball
let ball = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    dx: 4,
    dy: 4,
    radius: 10
};

//score
let score = [0, 0];
const maxScore = 5;

//game loop
let gameActive = true;

/*--------------
socket.io Server
--------------*/

const { Server } = require("socket.io");
const io = new Server(http); //create new socket.io server, attach it to http server

//on connection to socket.io server
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    //check if there are already 2 players connected
    if (players.length >= 2) {
        socket.emit("gameFull"); //notify client the game is full
        socket.disconnect(); //disconnect the client
        return;
    };

    //assign playerID based on player count
    let playerID = players.length;
    players.push({ id: playerID, socket: socket }); //push to players list

    //send the playerID to the client
    socket.emit("playerID", { id: playerID });

    //enough players to start
    if (players.length === 2) {
        io.emit("gameStart"); //game begins
    };

    //player movements synced on both connections
    socket.on("playerMove", (data) => {
        const player = players.find(player => player.id === data.id);
        if (player) {
            player.y = data.y;
            socket.broadcast.emit("playerMove", data); //sync player movement to other player
        };
    });

    //ball movements synced on both connections
    socket.on("ballMove", (data) => {
        if (!gameActive) return;
        ball = data; //update ball position on server

        //ball crossed the left boundary
        if (data.x < 0) { 
            score[1]++; //increase score for player 1
            io.emit("scoreUpdate", score); //emit updated score

        //ball crossed the right boundary
        } else if (data.x > canvasWidth) {
            score[0]++; //increase score for player 0
            io.emit("scoreUpdate", score); //emit updated score
        };

        //player wins
        if (score[0] >= maxScore) socket.broadcast.emit("gameOver", { winner: 0 }); //winner is 0
        if (score[1] >= maxScore) socket.broadcast.emit("gameOver", { winner: 1 }); //winner is 1

        socket.broadcast.emit("ballMove", data); //sync ball movement to other player
    });

    //update score
    socket.on("scoreUpdate", (data) => {
        score = data;
        //one of the players meets win criteria (maxScore of 5)
        if (score[0] >= maxScore || score[1] >= maxScore) {
            io.emit("gameOver"); //game is over
        };
    });

    //player disconnects
    socket.on("disconnect", () => {
        console.log(`${socket.id} has disconnected.`);
        players = players.filter(player => player.socket !== socket); //remove player from players list
        //only one player left
        if (players.length === 1) {
            io.emit("gameOver", { winner: players[0].id }); //notify remaining player
        };
    });

    //update gameFull
    socket.on("gameFull", () => {
        socket.emit("gameFullMessage", "The game is full. Please try again later."); //notify extra client
    });

    //set update gameOver
    socket.on("gameOver", ({ winner }) => {
        gameActive = false; //stop loop
        io.emit("gameOverMessage", `Game Over! Player ${winner} wins!`); //notify players of winner
    });
});

/*---------------
GET/POST Requests
---------------*/
//handle index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});