//to install required modules, in terminal: "npm i express ejs path socket.io http"

const express = require("express"); //import express
const app = express(); //initialize express with app

const ejs = require("ejs"); //import ejs
const path = require("path");

app.set("view engine", "ejs"); // set view engine
app.set("views", path.join(__dirname, "../views"));
app.use(express.urlencoded({ extended: true })); //encode url

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
const { default: Player } = require("./player");
const { default: Ball } = require("./ball");
const sio = new Server(http); //create new socket.io server, attach it to http server

const playerList = {}; 

sio.on("connection", (socket) => { //on connection to socket.io server
    
    console.log(`User connected: ${socket.id}`);
    playerList[socket.id] = new Player(socket.id); //create new player
    userList(sio); //update user list on new connection
    
    sio.on("close", () => console.log(`${socket.id} has disconnected.`)); //player disconnects
        console.log(`${socket.id} has disconnected.`);
        delete playerList[socket.id]; //remove player from list
    });

    sio.on("currentPlayers", (players) => { //update current players list
        for (let id in players) {
            if (players[id] === socket.id) {
                playerList[socket.id].id = players[id]; //assign new player's ID
            };
        };
    });

    sio.on("move", (data) => {
        movePlayer(socket.id, data);
    });

function userList(io) {
    const users = Object.keys(playerList); //get connected users' IDs
    console.log("Connected users:", users);
    io.emit("updateUserList", users); //emit the updated list to clients
}

/*---------------
GET/POST Requests
---------------*/

//handle index
app.get("/", (req, res) => {
    res.render("game");
});