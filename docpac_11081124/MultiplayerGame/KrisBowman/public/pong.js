const socket = io(); //establish socket connection

/*--------------
Default settings
--------------*/

//canvas
const cv = document.getElementById("cv")
const ctx = cv.getContext("2d");

//paddle
const paddleWidth = 20;
const paddleHeight = 100;
const paddleSpeed = 5;

//ball
let ball = {
    x: cv.width / 2,
    y: cv.height / 2,
    dx: 4,
    dy: 4,
    radius: 10
};

//score
let score = [0, 0];
const maxScore = 5;

//game loop
let gameActive = true;

/*-----
Players
-----*/

//create player objects and define their properties
const PLAYER = [{
    id: 0,
    x: 10,
    y: cv.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
},
{
    id: 1,
    x: cv.width - paddleWidth - 10,
    y: cv.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
}];

/*-------------
Player Movement
-------------*/

//events
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//direction keys
let wDown = false;
let sDown = false;

//playerID
let playerID;

socket.on("playerID", (id) => {
    playerID = id; //set playerID when received from server
});

//set keys to true when pressed
function keyDownHandler(e) {
    if (e.code === "KeyW") wDown = true;
    if (e.code === "KeyS") sDown = true;
};

function keyUpHandler(e) {
    if (e.code === "KeyW") wDown = false;
    if (e.code === "KeyS") sDown = false;
};

socket.on("playerMove", (data) => {
    PLAYER.forEach(player => {
        if (player.id === data.id) {
            player.y = data.y;
        };
    });
});

function handlePlayerMove() {
    PLAYER.forEach(player => {
        //move player on key down
        if (player.id === playerID) {
            if (sDown) player.y += paddleSpeed;
            if (wDown) player.y -= paddleSpeed;
        };

        //player cannot leave canvas
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > cv.height) player.y = cv.height - player.height;

        //emit movement to server
        socket.emit("playerMove", { id: player.id, y: player.y });

    });
};

/*-----------
Ball Movement
-----------*/

socket.on("ballMove", (data) => {
    ball = data; //update ball position from server
});

socket.on("scoreUpdate", (newScore) => {
    score = newScore; //update score from server
});

function messageUpdate(data) {
    document.getElementById("gameStatus").innerText = data.message;
};

socket.on("gameFull", (data) => {
    messageUpdate(data);
});

socket.on("gameOver", (data) => {
    messageUpdate(data);
    gameActive = false;
    window.location.reload(); //reload the page to restart the game
});

/*--
Draw
--*/

function draw() {
    if (!gameActive) return;

    //erase the screen
    ctx.clearRect(0, 0, cv.width, cv.height);

    //draw paddles
    ctx.fillStyle = "#fff";
    PLAYER.forEach(player => {
        ctx.fillRect(player.x, player.y, player.width, player.height);
    });

    //draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();

    //draw score
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(score[0], cv.width / 4, 30);
    ctx.fillText(score[1], (cv.width * 3) / 4, 30);
};

function loop() {
    if (gameActive) { //only loop if the game is active
        handlePlayerMove();
        draw();
        requestAnimationFrame(loop);
    };
};

loop(); //start game loop