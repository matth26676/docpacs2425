const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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
var playerX = MAP_SCALE + 20;
var playerY = MAP_SCALE + 20;
var playerAngle = Math.PI / 3;
var playerMoveX = 0;
var playerMoveY = 0;
var playerMoveAngle = 0;

// handle key down events
document.addEventListener('keydown', function (event) {
    var key = event.keyCode;
    switch (key) {
        case 83: playerMoveX = -1; playerMoveY = -1; break; // s
        case 87: playerMoveX = 1; playerMoveY = 1; break; // w
        case 65: playerMoveAngle = 1; break; // a
        case 68: playerMoveAngle = -1; break; // d
    }
});
document.addEventListener('keyup', function (event) {
    var key = event.keyCode;
    switch (key) {
        case 83: playerMoveX = 0; playerMoveY = 0; break; // s
        case 87: playerMoveX = 0; playerMoveY = 0; break; // w
        case 65: playerMoveAngle = 0; break; // a
        case 68: playerMoveAngle = 0; break; // d
        case 77: showMap = !showMap; break; // m
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
    img.src = "static/walls/" + filename + ".png";
    WALLS.push(img);
    console.log(WALLS);
}

// Game Loop
function gameLoop() {
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
    var playerMapX = (playerX / MAP_SCALE) * 5 + mapOffsetX;
    var playerMapY = (playerY / MAP_SCALE) * 5 + mapOffsetY;

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


    // Draw 2d map
    if (showMap) {
        for (var row = 0; row < MAP_SIZE; row++) {
            for (var col = 0; col < MAP_SIZE; col++) {
                var square = row * MAP_SIZE + col;
                if (map[square] != 0) {
                    ctx.fillStyle = 'green';
                    ctx.fillRect(mapOffsetX + col * 5, mapOffsetY + row * 5, 5, 5);
                } else {
                    ctx.fillStyle = '#aaa';
                    ctx.fillRect(mapOffsetX + col * 5, mapOffsetY + row * 5, 5, 5);
                }
            }
        }

        // Draw player on 2D map
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(playerMapX, playerMapY, 2, 0, DOUBLE_PI, true);
        ctx.fill();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(playerMapX, playerMapY);
        ctx.lineTo(playerMapX + Math.sin(playerAngle) * 5, playerMapY + Math.cos(playerAngle) * 5);
        ctx.stroke();
    }

    // fix wall layout
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, mapOffsetY);
    ctx.fillRect(0, mapOffsetY + WIDTH, canvas.width, canvas.width - mapOffsetY + WIDTH);

    //inf loop
    setTimeout(gameLoop, cycleDelay);

    // Draw FPS
    ctx.fillStyle = 'black';
    ctx.font = '1vi Arial';
    ctx.fillText('FPS: ' + fps_rate, 5, 15);
    console.log(
        'canvasWidth: ' + canvas.width,
        'playerX: ' + playerX,
        'playerY: ' + playerY,
        'playerAngle: ' + playerAngle,
        'mapTargetX: ' + mapTargetX,
        'mapTargetY: ' + mapTargetY,
        'mapOffsetX: ' + mapOffsetX,
        'mapOffsetY: ' + mapOffsetY,
        'playerMapX: ' + playerMapX,
        'playerMapY: ' + playerMapY,
    )


} window.onload = function () { gameLoop(); };