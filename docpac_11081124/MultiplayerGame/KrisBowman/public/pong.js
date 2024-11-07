const socket = io(); //establish socket connection

/*--------------
Default settings
--------------*/

//canvas
const cv = document.getElementById("cv")
const ctx = cv.getContext("2d");

//paddle
const paddleWidth = 15;
const paddleHeight = 100;
const paddleSpeed = 4;

//ball
const ballRadius = 10;
const ball = { x: cv.width / 2, y: cv.height / 2, dx: 4, dy: 4, radius: ballRadius };

//score
let score = [0, 0];
const maxScore = 5;

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
            player.y += paddleSpeed;
        } else if (wDown) {
            player.y -= paddleSpeed;
        };

        //player cannot leave canvas
        if (player.y < 0) {
            player.y = 0;
        };
        if (player.y + player.height > cv.height) {
            player.y = cv.height - player.height;
        };

        socket.emit("playerMove", { //emit movement to server
            id: player.id,
            y: player.y
        });
    });
};

/*-----------
Ball Movement
-----------*/

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= cv.height) {
        ball.dy = -ball.dy;
    };

    PLAYER.forEach(player => {
        if (
            ball.x - ball.radius < player.x + player.width &&
            ball.x + ball.radius > player.x &&
            ball.y + ball.radius > player.y &&
            ball.y - ball.radius < player.y + player.height
        ) {
            ball.dx = -ball.dx;
        }
    });

    if (ball.x - ball.radius <= 0) {
        score[1]++;
        resetBall();
    } else if (ball.x + ball.radius >= cv.width) {
        score[0]++;
        resetBall();
    };
    socket.emit("ballMove", ball);
};

function resetBall() {
    ball.x = cv.width / 2;
    ball.y = cv.height / 2;
    ball.dx = -ball.dx;
    ball.dy = 4 * (Math.random() < 0.5 ? 1 : -1);
};

/*--------------
Server Responses
--------------*/

//update other player's position
socket.on("playerMove", (data) => {
    const otherPlayer = PLAYER.find(player => player.id === data.id);
    if (otherPlayer) {
        otherPlayer.y = data.y;
    }
});

//update ball position
socket.on("ballMove", (data) => {
    ball.x = data.x;
    ball.y = data.y;
    ball.dx = data.dx;
    ball.dy = data.dy;

    //score boundaries
    if (data.x < 0) { //ball crossed the left boundary
        score[1]++; //increase score for player 1
        socket.emit("scoreUpdate", score); //emit updated score

    } else if (data.x > cv.width) { //ball crossed the right boundary
        score[0]++; //increase score for player 0
        socket.emit("scoreUpdate", score); //emit updated score
    }

    if (score[0] >= maxScore) {
        io.emit("gameOver", { winner: 0 });
    };

    resetBall();
});

//update score
socket.on("scoreUpdate", (data) => {
    score = data;
});

//update gameFull
socket.on("gameFull", () => {
    alert("The game is full. Please try again later.");
    window.location.reload();
});

//update gameOver
socket.on("gameOver", () => {
    alert(`Player ${playerID} disconnected. Game Over.`)
    window.location.reload();
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
    if (score[0] >= maxScore || score[1] >= maxScore) {
        ctx.font = "36px Arial";
        ctx.fillStyle = "#fff";
        ctx.fillText(`Game Over! Player ${score[0] >= maxScore ? 0 : 1} wins!`, cv.width / 4, cv.height / 2);
        return; //stop further drawing
    };

    ctx.font = "24px Arial";
    ctx.fillText(score[0], cv.width / 4, 30);
    ctx.fillText(score[1], (cv.width * 3) / 4, 30);
};

function loop() {
    movePlayer();
    draw();
    requestAnimationFrame(loop);
}
loop(); //start game loop


