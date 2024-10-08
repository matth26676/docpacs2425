const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Wait Stuff
const xhr = new XMLHttpRequest();
var name = prompt("Who is this brave individual?");
xhr.open("POST", "/highscores", true);
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

function sendScore(name, score) {
    xhr.send(JSON.stringify({ name: name, score: score }));
}

var score = 0;
var textOpacity1 = 1;
var textOpacity2 = 1;
var textOpacity3 = 0;
var Stopwatch = 0;
var lastTime = 0;
var playAudio = false;
var gamePaused = true;
var switchy = false;
var blink = 0;
var failed = false;
var playButton = document.getElementById('playButton');
var retryButton = document.getElementById('retryButton');
var returnButton = document.getElementById('returnButton');
var scaryMusic = document.createElement('audio');
scaryMusic.src = "Ghost Story - Kevin MacLeod Horror Music.mp3";
scaryMusic.loop = true;

function startGame() {
    playButton.style.display = "none";
    returnButton.style.display = "none";
    gamePaused = false;
    scaryMusic.play();
    gameLoop();
}

const jermaScarePics = [
    "jermaStuff/jermaScare1.png",
    "jermaStuff/jermaScare2.png",
    "jermaStuff/jermaScare3.png",
    "jermaStuff/jermaScare4.png",
    "jermaStuff/jermaScare5.png",
    "jermaStuff/jermaScare6.png",
]

const jermaScareSounds = [
    "jermaStuff/jermaScream1.mp3",
    "jermaStuff/jermaScream2.mp3",
    "jermaStuff/jermaScream3.mp3",
    "jermaStuff/jermaScream4.mp3",
    "jermaStuff/jermaScream5.mp3",
    "jermaStuff/jermaScream6.mp3",
]

var scare = jermaScarePics[Math.floor(Math.random() * jermaScarePics.length)];
var scaryAudio = jermaScareSounds[Math.floor(Math.random() * jermaScareSounds.length)];

// FPS
const FPS = 60;
const cycleDelay = Math.floor(1000 / FPS);
var oldCycleTime = 0;
var cycleCount = 0;
var fps_rate = '...';

// map
const MAP_SIZE = 32;
const MAP_SCALE = 128;
const MAP_RANGE = MAP_SCALE * MAP_SIZE;
const MAP_SPEED = (MAP_SCALE / 2) / 10;
var map = [
    1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,


];
var showMap = false;

// player
var playerX = MAP_SCALE + 192;
var playerY = MAP_SCALE + 400;
var playerAngle = Math.PI;
var playerMoveX = 0;
var playerMoveY = 0;
var playerMoveAngle = 0;
var youmoved = false

// handle key down events
document.addEventListener('keydown', function (event) {
    var key = event.keyCode;
    switch (key) {
        case 83: playerMoveX = -1; playerMoveY = -1; youmoved = true; break; // s
        case 87: playerMoveX = 1; playerMoveY = 1; youmoved = true; break; // w
        case 65: playerMoveAngle = 1; youmoved = true; break; // a
        case 68: playerMoveAngle = -1; youmoved = true; break; // d
    }
});
document.addEventListener('mousemove', function (event) {
    youmoved = true
});
document.addEventListener('keyup', function (event) {
    var key = event.keyCode;
    switch (key) {
        case 83: playerMoveX = 0; playerMoveY = 0; break; // s
        case 87: playerMoveX = 0; playerMoveY = 0; break; // w
        case 65: playerMoveAngle = 0; break; // a
        case 68: playerMoveAngle = 0; break; // d
    }
});

// screen
const WIDTH = Math.floor(window.innerHeight / 3), HALF_WIDTH = WIDTH / 2;
const HEIGHT = Math.floor(window.innerHeight / 3), HALF_HEIGHT = HEIGHT / 2;

// camera
const DOUBLE_PI = Math.PI * 2;
const FOV = Math.PI / 3;
const HALF_FOV = FOV / 2;
const STEP_ANGLE = FOV / WIDTH;

// graphics
const WALLS = [];

// load wall textures
for (var filename = 0; filename < 3; filename++) {
    var img = document.createElement('img');
    img.src = "walls/" + filename + ".png";
    WALLS.push(img);
}

// Game Loop
function gameLoop() {
    if (gamePaused) return;
    // Update Stopwatch
    Stopwatch += cycleDelay / 1000
    // Update FPS
    cycleCount++;
    if (cycleCount >= 60) cycleCount = 0;
    var startTime = Date.now();
    var cycleTime = startTime - oldCycleTime;
    oldCycleTime = startTime;
    if (cycleCount % 60 == 0) fps_rate = Math.floor(1000 / cycleTime);
    // Resize dynamically
    canvas.width = window.innerWidth * 0.4;
    canvas.height = window.innerHeight * 0.4;
    if (!failed) {
        // update player position
        var playerOffsetX = Math.sin(playerAngle) * MAP_SPEED;
        var playerOffsetY = Math.cos(playerAngle) * MAP_SPEED;
        var mapTargetX = Math.floor(playerY / MAP_SCALE) * MAP_SIZE + Math.floor((playerX + playerOffsetX * playerMoveX * 5) / MAP_SCALE)
        var mapTargetY = Math.floor((playerY + playerOffsetY * playerMoveY * 5) / MAP_SCALE) * MAP_SIZE + Math.floor(playerX / MAP_SCALE)

        if (playerMoveX && map[mapTargetX] == 0) playerX += playerOffsetX * playerMoveX;
        if (playerMoveY && map[mapTargetY] == 0) playerY += playerOffsetY * playerMoveY;
        if (playerMoveAngle) playerAngle += 0.06 * playerMoveAngle;

        // Calculate map & player offsets
        var mapOffsetX = Math.floor(canvas.width / 2 - HALF_WIDTH);
        var mapOffsetY = Math.floor(canvas.height / 2 - HALF_HEIGHT);

        // Draw Background
        ctx.drawImage(WALLS[0], canvas.width / 2 - HALF_WIDTH, canvas.height / 2 - HALF_HEIGHT, WIDTH, HEIGHT);

        // Raycasting
        var currentAngle = playerAngle + HALF_FOV;
        var rayStartX = Math.floor(playerX / MAP_SCALE) * MAP_SCALE;
        var rayStartY = Math.floor(playerY / MAP_SCALE) * MAP_SCALE;


        // loop for casted rays
        for (var ray = 0; ray < WIDTH; ray++) {
            // get current angle sin & cos
            var currentSin = Math.sin(currentAngle); currentSin = currentSin ? currentSin : .000001;
            var currentCos = Math.cos(currentAngle); currentCos = currentCos ? currentCos : .000001;

            // vertical line intersection
            var rayEndX, rayEndY, rayDirectionX, verticalDepth, textureEndY, textureY;
            if (currentSin > 0) { rayEndX = rayStartX + MAP_SCALE; rayDirectionX = 1 }
            else { rayEndX = rayStartX; rayDirectionX = -1 }
            for (var offset = 0; offset < MAP_RANGE; offset += MAP_SCALE) {
                verticalDepth = (rayEndX - playerX) / currentSin;
                rayEndY = playerY + verticalDepth * currentCos;
                var mapTargetX = Math.floor(rayEndX / MAP_SCALE);
                var mapTargetY = Math.floor(rayEndY / MAP_SCALE);
                if (currentSin <= 0) mapTargetX += rayDirectionX;
                var targetSquare = mapTargetY * MAP_SIZE + mapTargetX;
                if (targetSquare < 0 || targetSquare >= map.length - 1) break;
                if (map[targetSquare] != 0) { textureY = map[targetSquare]; break; };
                rayEndX += rayDirectionX * MAP_SCALE;
            }
            textureEndY = rayEndY;

            // horizontal line intersection
            var rayEndY, rayEndX, rayDirectionY, horizontalDepth, textureEndX, textureX;
            if (currentCos > 0) { rayEndY = rayStartY + MAP_SCALE; rayDirectionY = 1 }
            else { rayEndY = rayStartY; rayDirectionY = -1 }
            for (var offset = 0; offset < MAP_RANGE; offset += MAP_SCALE) {
                horizontalDepth = (rayEndY - playerY) / currentCos;
                rayEndX = playerX + horizontalDepth * currentSin;
                var mapTargetX = Math.floor(rayEndX / MAP_SCALE);
                var mapTargetY = Math.floor(rayEndY / MAP_SCALE);
                if (currentCos <= 0) mapTargetY += rayDirectionY;
                var targetSquare = mapTargetY * MAP_SIZE + mapTargetX;
                if (targetSquare < 0 || targetSquare >= map.length - 1) break;
                if (map[targetSquare] != 0) { textureX = map[targetSquare]; break; };
                rayEndY += rayDirectionY * MAP_SCALE;
            }
            textureEndX = rayEndX;

            // render 3D projection
            var depth = verticalDepth < horizontalDepth ? verticalDepth : horizontalDepth;
            var textureImage = verticalDepth < horizontalDepth ? textureY : textureX;
            var textureOffset = verticalDepth < horizontalDepth ? textureEndY : textureEndX;
            textureOffset = textureOffset - Math.floor(textureOffset / MAP_SCALE) * MAP_SCALE;
            depth *= Math.cos(playerAngle - currentAngle);
            var wallHeight = Math.min(Math.floor(MAP_SCALE * 300 / (depth + 0.0001)), 50000);
            // ctx.fillStyle = verticalDepth < horizontalDepth ? '#bbb' : '#aaa';
            // ctx.fillRect(mapOffsetX + ray, mapOffsetY + (HALF_HEIGHT - wallHeight / 2), 1, wallHeight);


            ctx.drawImage(
                WALLS[textureImage],
                textureOffset,  // Source img x offset
                0,  // Source img y offset
                1, // Source img width
                128, // Source img height
                mapOffsetX + ray, // Target image x offset
                mapOffsetY + (HALF_HEIGHT - Math.floor(wallHeight / 2)), // Target image y offset
                1, // Target image width
                wallHeight, // Target image height

            );

            // update current angle
            currentAngle -= STEP_ANGLE;
        }

        // fix wall layout
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, mapOffsetY);
        ctx.fillRect(0, mapOffsetY + WIDTH, canvas.width, canvas.width - mapOffsetY + WIDTH);

        // Draw FPS
        ctx.fillStyle = 'black';
        ctx.font = '1vi Arial';
        ctx.fillText('FPS: ' + fps_rate, 5, 15);
    }


    // On Load jumpscare pop up text saying "WAIT!" followed by "DONT MOVE" in red that fades away
    if (!failed) {
        if (textOpacity1 > 0) {
            textOpacity1 = textFadeOut("WAIT!", textOpacity1, -0.02);; // decrease opacity (fade out)
        } else if (textOpacity2 > 0) {
            textOpacity2 = textFadeOut("DONT MOVE!", textOpacity2, -0.01);; // decrease opacity (fade out)
        } else if (textOpacity3 < 1) {
            let tempWatch = String(Stopwatch.toFixed(2));
            textOpacity3 = textFadeOut(tempWatch, textOpacity3, 0.01);; // decrease opacity (fade out)
            youmoved = false;
        }

        if (textOpacity3 >= 1) {
            let tempWatch = Stopwatch.toFixed(2);
            textOpacity3 = textFadeOut(tempWatch, textOpacity3, 0);; // decrease opacity (fade out)
            if (youmoved && !playAudio) {
                var audio = new Audio(scaryAudio);
                scaryMusic.pause();
                audio.play();
                playAudio = true;
                score = String(Stopwatch.toFixed(2));
                failed = true;
                sendScore(name, score);
            }
        }
        lastTime = Stopwatch;
    } else if (failed) {
        let jumpscare = document.createElement('img');
        jumpscare.src = scare;
        ctx.drawImage(jumpscare, 0, 0, canvas.width, canvas.height);
        if (Stopwatch - lastTime > 3) {
            if ((Stopwatch - lastTime) % .1 > .05 && blink < 12) {
                switchy = true;
                blink++
            } else {
                switchy = false;
            }
            if (switchy || blink > 12) {
                if (retryButton.style.display == "block") {
                    retryButton.style.display = "none";
                    returnButton.style.display = "none";
                }
                flashText("YOU SCORE " + score + "!", "255, 255, 255");
            } else {
                if (retryButton.style.display == "none") {
                    retryButton.style.display = "block";
                    returnButton.style.display = "block";
                }
                flashText("YOU SCORE " + score + "!", "0, 255, 0");
            }
        }

    }
    //inf loop
    setTimeout(gameLoop, cycleDelay);

} window.onload = function () { gameLoop(); };

function textFadeOut(text, opacity, am) {
    ctx.fillStyle = "rgba(0, 0, 0, " + opacity + ")";
    ctx.font = "bold 200% Arial";
    var textWidth = ctx.measureText(text).actualBoundingBoxLeft + ctx.measureText(text).actualBoundingBoxRight;
    var textHeight = ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent;
    // Text background
    ctx.fillRect(canvas.width / 2 - textWidth / 2, canvas.height / 2 - textHeight, textWidth, textHeight);
    ctx.fillStyle = "rgba(255, 0, 0, " + opacity + ")";
    var textWidth = ctx.measureText(text).width;
    ctx.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2);
    return opacity = opacity + am;
}

function flashText(text, color) {
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.font = "200% Comic Sans MS cursive";
    var textWidth = ctx.measureText(text).actualBoundingBoxLeft + ctx.measureText(text).actualBoundingBoxRight;
    var textHeight = ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent;
    // Text background
    ctx.fillRect(canvas.width / 2 - textWidth / 2, canvas.height / 2 - textHeight, textWidth, textHeight);
    ctx.fillStyle = "rgba(" + color + ", 1)";
    var textWidth = ctx.measureText(text).width;
    ctx.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2);
}