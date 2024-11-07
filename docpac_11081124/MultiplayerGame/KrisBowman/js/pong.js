const socket = io(); //establish socket connection

/*----
Canvas
----*/
const cv = document.getElementById("cv")
const ctx = cv.getContext("2d");

/*--------------
Default settings
--------------*/

//paddle
const paddleWidth = 10;
const paddleHeight = 100;
const paddleSpeed = 6;

//ball
const ball = { x: cv.width / 2, y: cv.height / 2, dx: 4, dy: 4, radius: ballRadius };
const ballRadius = 10;

//score
let score = [0, 0];

/*-----
Players
-----*/

//create player objects and define their properties
const PLAYER = [{
    x: 0,
    y: cv.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight, dy: 0
},
{
    x: cv.width - paddleWidth,
    y: cv.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight, dy: 0
}];

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

function movePlayer() {
    PLAYER.forEach(player => {
        //move player on key down
        if (sDown) {
            player.y += 5;
        } else if (wDown) {
            player.y -= 5;
        }
    });

    //player cannot leave canvas
    PLAYER.forEach(player => {
        if (player.y < 0) {
            player.y = 0;
        };
        if (player.y + player.height > cv.height) {
            player.y = cv.height - player.height;
        };
    });

    socket.emit("move", {
        position: { x: PLAYER.x, y: PLAYER.y }
    }); //emit movement to server
};

socket.on("ballMove", (data) => {
    ball.x = data.x;
    ball.y = data.y;
    ball.dx = data.dx;
    ball.dy = data.dy;
});

/*--
Draw
--*/

function draw() {
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
    ctx.fillText(score[0], canvas.width / 4, 30);
    ctx.fillText(score[1], (canvas.width * 3) / 4, 30);
};

function loop() {
    movePlayer();
    draw();
    requestAnimationFrame(loop);
}
loop(); //start game loop


