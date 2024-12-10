const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:http');

const app = express();
const server = createServer(app);

const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const { Server } = require('socket.io');
const io = new Server(server);

function loggedIn(req, res, next) {
    let user = req.query.user;
    if (user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Define a route
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to Express with EJS' });
});

app.get('/game', loggedIn, (req, res) => {
    let user = req.query.user;
    res.render('game', { title: 'Welcome to Express with EJS', user });
});

let users = {};

// map
const MAP_SIZE = 32;
const MAP_SCALE = 128;
const MAP_SPEED = (MAP_SCALE / 2) / 10;

// initialization
io.on('connection', (socket) => {
    // max users
    if (users.length > 4) {
        socket.emit('full');
        socket.disconnect();
        return;
    }

    // template values stuff
    const spawnAreaSize = 1000; // Define the size of the spawn area

    users[socket.id] = {
        name: 'unknown',
        userId: socket.id,
        playerSocket: socket,
        // player
        playerX: MAP_SCALE + 20 + (Math.random() * spawnAreaSize / 2),
        playerY: MAP_SCALE + 20 + (Math.random() * spawnAreaSize / 2),
        playerAngle: Math.PI / 3,
        playerMoveX: 0,
        playerMoveY: 0,
        playerMoveAngle: 0,
        imgNum: 0,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        score: 0,
    }

    let user = users[socket.id];

    socket.on('new-user', (data) => {
        console.log('New name connected: ' + data.name);
        users[socket.id].name = data.name;
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        delete users[socket.id];
        console.log('')
    });

    socket.on('resize', (data) => {
        users[socket.id].canvasWidth = data.canvasWidth;
        users[socket.id].canvasHeight = data.canvasHeight;
        users[socket.id].WIDTH = data.WIDTH;
        users[socket.id].HEIGHT = data.HEIGHT;
        users[socket.id].HALF_WIDTH = data.HALF_WIDTH;
        users[socket.id].HALF_HEIGHT = data.HALF_HEIGHT;
    });

    user.imgNum = Math.floor(Math.random() * 22) + 1;

});

// key inputs
io.on('connection', (socket) => {
    socket.on('keydown', (key) => {
        switch (key) {
            case 83: users[socket.id].playerMoveX = -1; users[socket.id].playerMoveY = -1; break; // s
            case 87: users[socket.id].playerMoveX = 1; users[socket.id].playerMoveY = 1; break; // w
            case 65: users[socket.id].playerStrafe = -1; break; // a
            case 68: users[socket.id].playerStrafe = 1; break; // d
        }
    });

    socket.on('keyup', (key) => {
        switch (key) {
            case 83: users[socket.id].playerMoveX = 0; users[socket.id].playerMoveY = 0; break; // s
            case 87: users[socket.id].playerMoveX = 0; users[socket.id].playerMoveY = 0; break; // w
            case 65: users[socket.id].playerStrafe = 0; break; // a
            case 68: users[socket.id].playerStrafe = 0; break; // d
        }
    });
    socket.on('mousemove', (data) => {
        users[socket.id].playerMoveAngle = -data;
    })
});

var map = [
    1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

setInterval(() => { step(); }, 1000 / 1000);

let capture = false;
let captureInfo = {
    playerX: Math.floor(MAP_SIZE / 2) * MAP_SCALE + MAP_SCALE / 2,
    playerY: Math.floor(MAP_SIZE / 2) * MAP_SCALE + MAP_SCALE / 2,
};

function step() {
    let tempUserList = {};

    for (var i in users) {
        let user = users[i];

        // player
        var playerX = user.playerX;
        var playerY = user.playerY;
        var playerAngle = user.playerAngle;
        var playerMoveX = user.playerMoveX;
        var playerMoveY = user.playerMoveY;
        var playerStrafe = user.playerStrafe;
        var playerMoveAngle = user.playerMoveAngle;

        // update player position
        var playerOffsetX = Math.sin(playerAngle) * MAP_SPEED;
        var playerOffsetY = Math.cos(playerAngle) * MAP_SPEED;
        var mapTargetX = Math.floor(playerY / MAP_SCALE) * MAP_SIZE + Math.floor((playerX + playerOffsetX * playerMoveX * 5) / MAP_SCALE);
        var mapTargetY = Math.floor((playerY + playerOffsetY * playerMoveY * 5) / MAP_SCALE) * MAP_SIZE + Math.floor(playerX / MAP_SCALE);

        if (playerMoveAngle) playerAngle += 0.01 * playerMoveAngle;

        if (playerMoveX || playerMoveY) {
            let moveVectorLength = Math.sqrt(playerMoveX * playerMoveX + playerMoveY * playerMoveY);
            let normalizedMoveX = playerMoveX / moveVectorLength;
            let normalizedMoveY = playerMoveY / moveVectorLength;

            if (map[mapTargetX] == 0) playerX += playerOffsetX * normalizedMoveX;
            if (map[mapTargetY] == 0) playerY += playerOffsetY * normalizedMoveY;
        }
        if (playerStrafe) {
            let strafeOffsetX = Math.sin(playerAngle - Math.PI / 2) * playerStrafe * 4; // Increase strafe speed by 4x
            let strafeOffsetY = Math.cos(playerAngle - Math.PI / 2) * playerStrafe * 4; // Increase strafe speed by 4x
            let strafeTargetX = Math.floor((playerY + strafeOffsetY) / MAP_SCALE) * MAP_SIZE + Math.floor((playerX + strafeOffsetX) / MAP_SCALE);
            let strafeTargetY = Math.floor((playerY + strafeOffsetY) / MAP_SCALE) * MAP_SIZE + Math.floor(playerX / MAP_SCALE);

            if (map[strafeTargetX] == 0) {
                playerX += strafeOffsetX;
            }
            if (map[strafeTargetY] == 0) {
                playerY += strafeOffsetY;
            }
        }

        // Update user object with new position
        user.playerX = playerX;
        user.playerY = playerY;
        user.playerAngle = playerAngle;

        // console.log(
        //     'canvasWidth: ' + user.canvasWidth,
        //     'playerX: ' + playerX,
        //     'playerY: ' + playerY,
        //     'playerAngle: ' + playerAngle,
        //     'mapTargetX: ' + mapTargetX,
        //     'mapTargetY: ' + mapTargetY,
        //     'mapOffsetX: ' + mapOffsetX,
        //     'mapOffsetY: ' + mapOffsetY,
        //     'playerMapX: ' + playerMapX,
        //     'playerMapY: ' + playerMapY,
        // );

        // Check if capture position is on top of a wall (value 1 in the map)
        if (map[Math.floor(captureInfo.playerY / MAP_SCALE) * MAP_SIZE + Math.floor(captureInfo.playerX / MAP_SCALE)] === 1) {
            // Re-randomize the capture position
            do {
                captureInfo.playerX = Math.floor(Math.random() * MAP_SIZE) * MAP_SCALE + MAP_SCALE / 2;
                captureInfo.playerY = Math.floor(Math.random() * MAP_SIZE) * MAP_SCALE + MAP_SCALE / 2;
            } while (map[Math.floor(captureInfo.playerY / MAP_SCALE) * MAP_SIZE + Math.floor(captureInfo.playerX / MAP_SCALE)] === 1);
        }

        // Check if any user is close to the capture point
        let distance = Math.sqrt(
            Math.pow(user.playerX - captureInfo.playerX, 2) +
            Math.pow(user.playerY - captureInfo.playerY, 2)
        );

        // If the user is within a certain distance (e.g., 50 units), re-randomize the capture point
        if (distance < 50 && !capture) {
            capture = true;
            user.score++;
            do {
                captureInfo.playerX = Math.floor(Math.random() * MAP_SIZE) * MAP_SCALE + MAP_SCALE / 2;
                captureInfo.playerY = Math.floor(Math.random() * MAP_SIZE) * MAP_SCALE + MAP_SCALE / 2;
            } while (map[Math.floor(captureInfo.playerY / MAP_SCALE) * MAP_SIZE + Math.floor(captureInfo.playerX / MAP_SCALE)] === 1);
            setTimeout(() => { capture = false; }, 250); // Reset capture flag after 1 second
        }

        // Check for collision with other users
        for (let j in users) {
            if (i !== j) {
                let otherUser = users[j];
                let otherDistance = Math.sqrt(
                    Math.pow(user.playerX - otherUser.playerX, 2) +
                    Math.pow(user.playerY - otherUser.playerY, 2)
                );

                // If the distance is less than a certain threshold (e.g., 50 units), prevent movement
                if (otherDistance < 50) {
                    if (playerMoveX) user.playerX -= playerOffsetX * playerMoveX;
                    if (playerMoveY) user.playerY -= playerOffsetY * playerMoveY;
                    if (playerMoveAngle) user.playerAngle -= 0.06 * playerMoveAngle;
                }
            }
        }

        // add the player to the temp player list
        tempUserList[user.userId] = {
            name: user.name,
            userId: user.userId,
            // Raycast stuff
            mapTargetX: mapTargetX,
            mapTargetY: mapTargetY,
            playerX: playerX,
            playerY: playerY,
            playerAngle: playerAngle,
            imgNum: user.imgNum,
            color: user.color,
            capture: captureInfo,
            score: user.score,
        };
    }

    // for every player in the player list
    for (var i in users) {
        let user = users[i];
        // send the player's position to the client
        user.playerSocket.emit('update', { users: tempUserList });
    }

}

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});