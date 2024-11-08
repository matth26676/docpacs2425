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

var availableCorners = [
    'bottom-left',
    'bottom-right',
    'top-left',
    'top-right',
];

let users = {};

// map
const MAP_SIZE = 32;
const MAP_SCALE = 128;
const MAP_RANGE = MAP_SCALE * MAP_SIZE;
const MAP_SPEED = (MAP_SCALE / 2) / 10;

io.on('connection', (socket) => {
    if (users.length > 4) {
        socket.emit('full');
        socket.disconnect();
        return;
    }
    users[socket.id] = {
        name: 'unknown',
        userId: socket.id,
        playerSocket: socket,
        //player
        playerX: MAP_SCALE + 20,
        playerY: MAP_SCALE + 20,
        playerAngle: Math.PI / 3,
        playerMoveX: 0,
        playerMoveY: 0,
        playerMoveAngle: 0,
        corner: 'undecided',
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
        if (user.corner != 'undecided') {
            availableCorners.push(user.corner);
        }
    });

    socket.on('resize', (data) => {
        users[socket.id].canvasWidth = data.canvasWidth;
        users[socket.id].canvasHeight = data.canvasHeight;
        users[socket.id].WIDTH = data.WIDTH;
        users[socket.id].HEIGHT = data.HEIGHT;
        users[socket.id].HALF_WIDTH = data.HALF_WIDTH;
        users[socket.id].HALF_HEIGHT = data.HALF_HEIGHT;
    });

    user.corner = availableCorners[0];
    availableCorners.shift();
    for (var i in users) {
        let user = users[i];
        console.log('user.corner: ' + user.corner);
    }
});


io.on('connection', (socket) => {
    socket.on('keydown', (key) => {
        switch (key) {
            case 83: users[socket.id].playerMoveX = -1; users[socket.id].playerMoveY = -1; break; // s
            case 87: users[socket.id].playerMoveX = 1; users[socket.id].playerMoveY = 1; break; // w
            case 65: users[socket.id].playerMoveAngle = 1; break; // a
            case 68: users[socket.id].playerMoveAngle = -1; break; // d
        }
    });

    socket.on('keyup', (key) => {
        switch (key) {
            case 83: users[socket.id].playerMoveX = 0; users[socket.id].playerMoveY = 0; break; // s
            case 87: users[socket.id].playerMoveX = 0; users[socket.id].playerMoveY = 0; break; // w
            case 65: users[socket.id].playerMoveAngle = 0; break; // a
            case 68: users[socket.id].playerMoveAngle = 0; break; // d
        }
    });
});

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

setInterval(() => { step(); }, 1000 / 1000);

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
        var playerMoveAngle = user.playerMoveAngle;

        // update player position
        var playerOffsetX = Math.sin(playerAngle) * MAP_SPEED;
        var playerOffsetY = Math.cos(playerAngle) * MAP_SPEED;
        var mapTargetX = Math.floor(playerY / MAP_SCALE) * MAP_SIZE + Math.floor((playerX + playerOffsetX * playerMoveX * 5) / MAP_SCALE);
        var mapTargetY = Math.floor((playerY + playerOffsetY * playerMoveY * 5) / MAP_SCALE) * MAP_SIZE + Math.floor(playerX / MAP_SCALE);

        if (playerMoveX && map[mapTargetX] == 0) playerX += playerOffsetX * playerMoveX;
        if (playerMoveY && map[mapTargetY] == 0) playerY += playerOffsetY * playerMoveY;
        if (playerMoveAngle) playerAngle += 0.06 * playerMoveAngle;

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
            corner: user.corner,
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