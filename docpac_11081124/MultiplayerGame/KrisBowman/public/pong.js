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


const ball = {
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

//set keys to true when pressed
function keyDownHandler(e) {
    if (e.code === "KeyW") wDown = true;
    if (e.code === "KeyS") sDown = true;
};

function keyUpHandler(e) {
    if (e.code === "KeyW") wDown = false;
    if (e.code === "KeyS") sDown = false;
};

function movePlayer() {
    PLAYER.forEach(player => {
        //move player on key down
        if (player.id === 0) {
            if (sDown) player.y += paddleSpeed;
            if (wDown) player.y -= paddleSpeed;
        } else if (player.id === 1) {
            if (sDown) player.y += paddleSpeed;
            if (wDown) player.y -= paddleSpeed;
        };

        //player cannot leave canvas
        if (player.y < 0) player.y = 0;
        if (player.y + player.height > cv.height) player.y = cv.height - player.height;


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
    if (!gameActive) return;
    if (score[0] < maxScore && score[1] < maxScore) {
        ball.x += ball.dx;
        ball.y += ball.dy;
    };

    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= cv.height) ball.dy = -ball.dy;

    PLAYER.forEach(player => {
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
    if (score[0] < maxScore && score[1] < maxScore) {
        ball.x = canvasWidth / 2;
        ball.y = canvasHeight / 2;
        ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4; //random horizontal
        ball.dy = (Math.random() < 0.5 ? 1 : -1) * 4; //random vertical
        socket.emit("ballMove", ball)
    };
};

socket.on("gameFullMessage", (message) => {
    document.getElementById("gameStatus").innerText = message;
});

socket.on("gameOverMessage", (message) => {
    alert(message);
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
    if (!gameActive) return resetGame(); //stop loop if the game is over
    movePlayer();
    moveBall();
    draw();
    requestAnimationFrame(loop);
}

function resetGame() {
    score = [0, 0];
    ball = {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        dx: 4,
        dy: 4,
        radius: 10
    };
    gameActive = true;
    loop(); //restart game loop
    io.emit("gameStart"); //notify players to start new game
}
