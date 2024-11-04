//to install required modules, in terminal: "npm i express ejs io.io http"

const express = require("express"); //import express
const app = express(); //initialize express with app

const ejs = require("ejs"); //import ejs

app.set("view engine", "ejs"); // set view engine
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

const io = require("socket.io"); //import io.io
const sio = new io.Server({ server: http }); //create new io.io server, attach it to http server

sio.on("connection", (io => { //on connection to Webio server
    io.on("close", () => console.log(`${io.id} has disconnected.`)); //user disconnects
    userList(sio); //reload user list

    io.on("connection", (io) => {
        console.log("User connected.");
    });

    io.on("move" => {

    });
}));

/*----
Canvas
----*/
const cv = document.getElementById("cv")
const ctx = cv.getContext("2d");

/*-----
Players
-----*/

//create player object
const PLAYER = {};

//properties for player
PLAYER.id += 1
PLAYER.x = 400;
PLAYER.y = 300;
PLAYER.w = 25;
PLAYER.h = 50;

/*---------------
keyboard controls
---------------*/

//events
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//direction keys
let wDown = false;
let sDown = false;

//set keys to true when pressed
function keyDownHandler(e) {
    if (e.code === "KeyW") {
        wDown = true;
    } else if (e.code === "KeyS") {
        sDown = true;
    };
};
function keyUpHandler(e) {
    if (e.code === "KeyW") {
        wDown = false;
    } else if (e.code === "KeyS") {
        sDown = false;
    };
};

//move player on key down
if (sDown) {
    PLAYER.y += 5;
} else if (wDown) {
    PLAYER.y -= 5;
};

//player cannot leave canvas
if (PLAYER.x < 0) {
    PLAYER.x = 0
} else if (PLAYER.y < 0) {
    PLAYER.y = 0
};

if (PLAYER.x + PLAYER.w > cv.width) {
    PLAYER.x = cv.width - PLAYER.w
} else if (PLAYER.y + PLAYER.h > cv.height) {
    PLAYER.y = cv.height - PLAYER.h
};

    /*--
    Draw
    --*/

    function draw() {
        ;
        //erase the screen
        ctx.clearRect(0, 0, cv.width, cv.height);

        //draw the player
        ctx.drawImage(PLAYER.img, PLAYER.x, PLAYER.y, PLAYER.w, PLAYER.h);

        //text in top left
        ctx.strokeText("keyboard (wasd)", 0, 10);
        ctx.strokeText("x: " + PLAYER.x, 0, 20);
        ctx.strokeText("y: " + PLAYER.y, 0, 30);
    };

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    };

    PLAYER.img.onload = function () {
        loop();
    };

    /*---------------
    GET/POST Requests
    ---------------*/

    //handle index
    app.get("/", (req, res) => {
        res.render("game");
    });