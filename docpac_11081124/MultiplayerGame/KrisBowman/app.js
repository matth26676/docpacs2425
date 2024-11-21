//to install required modules, in terminal: "npm i express path http socket.io"

const { log } = require("console");
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
let players = {};

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

/*--------------
socket.io Server
--------------*/

const { Server } = require("socket.io");
const io = new Server(http); //create new socket.io server, attach it to http server

//on connection to socket.io server
io.on("connection", (socket) => {
    //assign id to new player
    const playerID = Object.keys(players).length;
    console.log(`New user ${socket.id} assigned to ${playerID}`);

    //check if there are already 2 players connected
    if (playerID >= 2) {
        socket.emit("gameFull", { message: "The game is full. Spectating..." }); //notify client the game is full
        return socket.disconnect(); //disconnect the client
    };

    players[socket.id] = { id: playerID, x: 10, y: canvasHeight / 2, width: 20, height: 100 }; //add player
    socket.emit("playerID", playerID); //send the playerID to the client

    //enough players to start
    if (Object.keys(players).length === 2) {
        io.emit("gameStart"); //game begins
    };

    //player movements synced on both connections
    socket.on("playerMove", (data) => {
        players[socket.id].y = data.y;
        io.emit("playerMove", { id: data.id, y: data.y });
    });

    //ball movements synced on both connections
    setInterval(() => {
        if (!isGameOver()) {
            ball.x += ball.dx;
            ball.y += ball.dy;
        };

        handleBallMove(ball);
        collisions(ball);
        io.emit("ballMove", ball);
    }, 16);

    //player disconnects
    socket.on("disconnect", () => {
        console.log(`${socket.id} has disconnected.`);

        //remove player from players list
        delete players[socket.id];

        //only one player left
        if (Object.keys(players).length === 1) {
            io.emit("gameOver", { message: "The other player has disconnected." }); //notify remaining player
        };
    });

    function handleBallMove(ball) {
        if (ball.x < 0) { //ball crossed the left boundary
            score[1]++; //increase score for player 1

        } else if (ball.x > canvasWidth) { //ball crossed the right boundary
            score[0]++; //increase score for player 0
        };

        io.emit("scoreUpdate", score); //emit updated score
        resetBall();

        if (isGameOver()) {
            io.emit("gameOver", { message: `Player ${score[0] >= maxScore ? 0 : 1} won!` })
            return;
        };

        io.emit("scoreUpdate", score);
    };

    function collisions(ball) {
        if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvasHeight) ball.dy = -ball.dy;

        Object.values(players).forEach(player => {
            if (
                ball.x - ball.radius < player.x + player.width &&
                ball.x + ball.radius > player.x &&
                ball.y + ball.radius > player.y &&
                ball.y - ball.radius < player.y + player.height
            ) {
                let angle = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
                ball.dy = angle * 4;  //adjust angle based on where ball hit paddle
                ball.dx = -ball.dx * 1.05; //slight speed increase
                ball.dy *= 1.05;
            };
        });
    };

    function resetBall() {
        if (!isGameOver()) {
            ball.x = canvasWidth / 2;
            ball.y = canvasHeight / 2;
            ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4; //random horizontal speed
            ball.dy = (Math.random() < 0.5 ? 1 : -1) * 4; //random vertical speed
        };
    };

    function isGameOver() {
        return score[0] >= maxScore || score[1] >= maxScore;
    };
});

/*---------------
GET/POST Requests
---------------*/

//handle index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});