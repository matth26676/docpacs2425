//////////////////////////////////////////////////////////////////
// __        __     _       __  _                   _           //
// \ \      / /___ | |__   / _|(_)  ___  _ __    __| | ___  _   //
//  \ \ /\ / // _ \| '_ \ | |_ | | / _ \| '_ \  / _` |/ __|(_)  //
//   \ V  V /|  __/| |_) ||  _|| ||  __/| | | || (_| |\__ \ _   //
//    \_/\_/  \___||_.__/ |_|  |_| \___||_| |_| \__,_||___/(_)  //
//  ____          _         _                        ____       //
// / ___|  _ __  | |  __ _ | |_  ___    ___   _ __  |  _ \      //
// \___ \ | '_ \ | | / _` || __|/ _ \  / _ \ | '_ \ | | | |     //
//  ___) || |_) || || (_| || |_| (_) || (_) || | | || |_| |     //
// |____/ | .__/ |_| \__,_| \__|\___/  \___/ |_| |_||____/      //
//        |_|                                                   //
//////////////////////////////////////////////////////////////////

/*
------------------- To Do -------------------
    __Clean Up Oauth and Login__
Make the login and oauth cleaner and more efficient

    __Restart__
Give players the option to restart the game

    __Game Code Append__
When a user creates a game, make sure the code will appear without reloading the page

    __Game Settings__
Allow the game to be customized by the host

    __Leaderboard__
Create a leaderboard to show the top players, their wins, their win rates, win loss ratio

    __Settings__
Create a settings page to change your display name, color, and other settings

    __Power Ups__
Add power ups to the game to give players an advantage
Possible power ups:
    - Inkroller (Covers a 3x3 area)
    - Inkwall (Prevents a 3x3 area from being clicked. Lasts 5 seconds)
    - Inkshield (Prevents a 3x3 area from being clicked. Lasts 3 clicks per box)
    - Inknade (Erases color in a 5x5 area)
    - Inkstrike (Covers a whole column)
    - Inkzooka (Covers a whole row)
    - Inkjet (Covers a 3x3 area with a random color)
    - Inkmine (Covers a 5x5 area if another player clicks on it. Does nothing if the player who placed it clicks on it)
    - Inkstorm (Covers a 5x5 area with a random color)

    __Teams__
Add teams to the game to allow players to play cooperatively

    __Bug Fixes__
Fix bugs that will inevitably arise
    Known bugs:
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////
//  ____          __  _         _                      //
// |  _ \   ___  / _|(_) _ __  (_) _ __    __ _        //
// | | | | / _ \| |_ | || '_ \ | || '_ \  / _` |       //
// | |_| ||  __/|  _|| || | | || || | | || (_| |       //
// |____/  \___||_|  |_||_| |_||_||_| |_| \__, |       //
// __     __            _         _      _|___/        //
// \ \   / /__ _  _ __ (_)  __ _ | |__  | |  ___  ___  //
//  \ \ / // _` || '__|| | / _` || '_ \ | | / _ \/ __| //
//   \ V /| (_| || |   | || (_| || |_) || ||  __/\__ \ //
//    \_/  \__,_||_|   |_| \__,_||_.__/ |_| \___||___/ //
//   ___     ____         _                            //
//  ( _ )   / ___|   ___ | |_  _   _  _ __             //
//  / _ \/\ \___ \  / _ \| __|| | | || '_ \            //
// | (_>  <  ___) ||  __/| |_ | |_| || |_) |           //
//  \___/\/ |____/  \___| \__| \__,_|| .__/            //
//                                   |_|               //
/////////////////////////////////////////////////////////

// Set up the variables
const express = require('express');
const app = express();
const {createServer} = require('http');
const ws = require('websocket').server;
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sqlite3 = require('sqlite3');
const AUTH_URL = 'http://172.16.3.100:420/oauth';
const THIS_URL = 'http://172.16.3.206:3000/oauth';
const SECRET = 'secret'
const crypto = require("crypto");

// Make the static directory the current directory
app.use(express.static(__dirname + '/'));
// Set the view engine to ejs
app.set('view engine', 'ejs');
// Set up the middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
    // Sets up the secret for the session. Not to be shared/published
    secret: `${SECRET}`,
    resave: false,
    saveUninitialized: false
}))

// Sets up the database for the game
const db = new sqlite3.Database('data/database.db', (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Database: Connected database');
    };
});

// Set up the isAuthenticated middleware
const isAuthenticated = (req, res, next) => {
    // If the session user exists, continue
    if (req.session.user) next();
    // Else, redirect to /login
    else res.redirect('/login');
};

// Set up the hashPassword function
const hashPassword = (password, salt = null) => {
    // Generate a new salt if not provided
    salt = salt || crypto.randomBytes(16).toString('hex');
    // Derive the hash using PBKDF2
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    // Return the salt and hash
    return { salt, hash };
}

// Set up the verifyPassword function
const verifyPassword = (password, hash, salt) => {
    // Set the derived hash to the hash of the password and salt
    const { hash: derivedHash } = hashPassword(password, salt);
    // Check if the derived hash is equal to the provided hash
    return hash === derivedHash;
};

// Listen on port 3000 and relay that
app.listen(3000, console.log(`App: Listening on port 3000`));

////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
//  _____                                 ____          _       //
// | ____|_  ___ __  _ __ ___  ___ ___   / ___|___   __| | ___  //
// |  _| \ \/ / '_ \| '__/ _ \/ __/ __| | |   / _ \ / _` |/ _ \ //
// | |___ >  <| |_) | | |  __/\__ \__ \ | |__| (_) | (_| |  __/ //
// |_____/_/\_\ .__/|_|  \___||___/___/  \____\___/ \__,_|\___| //
//            |_|                                               //
//////////////////////////////////////////////////////////////////

// When the user gets /...
app.get('/', (req, res) => {
    // Render the index page
    res.render('index');
});

// When the user gets /game...
app.get('/game', (req, res) => {
    // Render the game page
    res.render('game');
});

// When the user gets /login...
app.get('/login', (req, res) => {
    // Render the login page
    res.render('login');
});

// Set up the login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Query the database for the user
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        if (!user) {
            return res.status(401).send('Invalid username or password');
        }
        // Compare the password with the stored hash
        const isValid = verifyPassword(password, user.password, user.salt);
        if (!isValid) return res.status(401).send('Invalid username or password');
        // Set the session user
        req.session.user = username;
        res.redirect('/user');
    });
});

// When the user gets /register...
app.get('/register', (req, res) => {
    res.render('register');
});

// When the user posts /register...
app.post('/register', (req, res) => {
    // Set the username and password to the request's body
    const { username, password } = req.body;
    // Set the hash and the salt to the hashed password
    const { hash, salt } = hashPassword(password);
    // Query the database for the user
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        // If there is an error...
        if (err) {
            // Send a 500 status and a database error message
            return res.status(500).send('Database error');
        };
        // If the user already exists...
        if (user) {
            // Send a 400 status and a user already exists message
            return res.status(400).send('User already exists');
        };
        // Insert the new user into the database
        db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?)', [username, hash, salt], (err) => {
            // If there is an error...
            if (err) {
                // Send a 500 status and a database error message
                return res.status(500).send('Database error');
            };
            // Redirect to the login page
            res.redirect('/login');
        });
    });
});

// When the user gets /oauth...
app.get('/oauth', (req, res) => {
    // If the user has a token...
    if (req.query.token) { 
        // Let the user's token data be the decoded token
        let tokenData = jwt.decode(req.query.token);
        // Set the session token and user to the tokenData and the tokenData's username, respectively
        req.session.token = tokenData;
        req.session.user = tokenData.username;
        // Redirect to user
        res.redirect(`user`);
    // Else...
    } else {
        // Redirects to the formbar oauth page with the redirectURL being the current URL
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

// When the user gets /user...
app.get(`/user`, isAuthenticated, (req, res) => {
    // Try...
    try {
        // Render the user page with the user variable assigned to the session user
        res.render('user', {user: req.session.user});
    // Catch any errors and send the error message
    } catch (err) {
        // Catches any errors and sends the error message
        res.send(err.message);
    };
});

// When the user gets /leaderboard...
app.get('/leaderboard', (req, res) => {
        // Orders users by their score in descending order
        db.all('SELECT * FROM users ORDER BY score DESC', (err, rows) => {
            if (err) {
                console.error(err.message);
            };
            // Get only the top 10
            rows = rows.slice(0, 10);
            // Render the leaderboard page and assign the rows to users
            res.render('leaderboard', {users: rows});
        });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
//   ____                         ____          _       //
//  / ___| __ _ _ __ ___   ___   / ___|___   __| | ___  //
// | |  _ / _` | '_ ` _ \ / _ \ | |   / _ \ / _` |/ _ \ //
// | |_| | (_| | | | | | |  __/ | |__| (_) | (_| |  __/ //
//  \____|\__,_|_| |_| |_|\___|  \____\___/ \__,_|\___| //
//                                                      //
//////////////////////////////////////////////////////////

const powerups = require('./powerups');
const powerupMap = [powerups.InkRoller, powerups.InkWall, powerups.InkMine];

const powerupTime = 5; //time in seconds until powerups drop.

// Create the http server 
const httpServer = createServer();
// Listen on port 9090. Listen on all network interfaces
httpServer.listen(9090, '0.0.0.0', console.log(`HTTP: Listening on port 9090`));

// Create the client and game hashmap for all your webfiends
const clients = {};
const games = {};

// Create the websocket server
// My socks are soggy and gross!
const wss = new ws({
    'httpServer': httpServer
});

// On connecting to the server..
wss.on('request', (request) => {
    // Assign the connection to the request and accept the connection
    const connection = request.accept(null, request.origin);
    // On closing a connection...
    connection.on('close', () => {
        // Find the client by the connection and assign it to clientID
        const clientID = Object.keys(clients).find((c) => clients[c].connection === connection);
        // Delete the client from the clients list
        delete clients[clientID];
        // If that client is in a game, delete them from the game
        // For each game in games...
        Object.keys(games).forEach((g) => {
            // Assign the game from the games object
            const game = games[g];
            // Find the client by the client ID and assign it to clientIndex
            const clientIndex = game.clients.findIndex((c) => c.clientID === clientID);
            // If the client index is not negative one...
            if (clientIndex !== -1) {
                // Assign the client to the client from the game using the client index
                const client = game.clients[clientIndex];
                // Add the player's slot and color back to the available lists
                game.slots.push(client.player);
                game.colors.push(client.color);
                // Sort the available slots to maintain the correct order
                game.slots.sort();
                game.colors.sort();
                // Splice that client from the game
                game.clients.splice(clientIndex, 1);
                // If the game has no clients, delete the game
                if (game.clients.length === 0) delete game;
            };
            // Create the disconnect payload
            const payload = {
                'method': 'disconnect',
                'clientID': clientID
            };
            // For each client in the game...
            game.clients.forEach((c) => {
                // Send a stringified payload to each client to notify that a client has disconnected
                if (clients[c.clientID]) {
                    clients[c.clientID].connection.send(JSON.stringify(payload));
                };
            });
        });
    });
    // On recieving a message, JSON parse the message and save it to result
    connection.on('message', (message) => {
        // This assumes all the messages being sent by the clients are JSON which is bad practice, but for simplicities sake, I am assuming all the clients will be good little webfiends. Webfriends, if you will
        const res = JSON.parse(message.utf8Data);
        // If the method is create...
        if (res.method === 'create') {
            // Assign the client ID and the game ID
            const clientID = res.clientID;
            // If the client has already created a game, return
            if (comb(clientID, 'create')) return;
            const gameID = guid();
            // Add the game ID to the games object
            games[gameID] = {
                'id': gameID,
                'boxes': 64,
                'time': 30,
                'frame': 0,
                'clients': [],
                'powerupNames': powerupMap.map(p => p.name),
                'creator': clientID,
            };

            // Create the create payload 
            const payload = {
                'method': 'create',
                'game': games[gameID]
            };
            // Send the create payload for the game through the client connection
            clients[clientID].connection.send(JSON.stringify(payload));
        };
        // If the method is join...
        if (res.method === 'join'){
            // Set the IDs and the Game
            const clientID = res.clientID;
            const gameID = res.gameID;
            // If there is no gameID or the player is in a game, return
            if (!gameID) return;
            // Set the game from the games object
            const game = games[gameID];
            if (comb(clientID)) return;
            // if (client) return;
            // If there are more than 5 players...
            if (game.clients.length >= 6) {
                // Notify that the maximum amount of players has been reached
                console.log(`Game (${gameID}) is at maximum capacity.`)
                // Return
                return;
            };
            // If the slots or colors of the game do not exist, create the slots and colors arrays
            if (!game.slots || !game.colors) {
                game.slots = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6'];
                game.colors = ['#da0000', '#000bda', '#00961c', '#c7de00', '#b700b1', '#eaa400'];
            }
            // Get the lowest available slot and color
            const player = game.slots.shift();
            const color = game.colors.shift();
            // Add that client to the game
            game.clients.push({
                'clientID': clientID,
                'color': color,
                'player': player,
                'powerups': [null, null],
                "selectedPowerup": null, //this is used as an index into the players powerup array
                "selectedPowerupName": "",
                'score': 0
            });
            // Create the join payload
            const payload = {
                'method': 'join',
                'game': game
            };
            
            // For each client in the game...
            game.clients.forEach((c) => {
                // Send a stringified payload to each client to notify that a new client has joined
                if (clients[c.clientID]) {
                    clients[c.clientID].connection.send(JSON.stringify(payload));
                };
            });
        };
        // If the method is start...
        if (res.method === 'start') {
            // Set the game's ID, set the player that sent the payload, and set the game
            const gameID = res.gameID;
            const player = res.player;
            const game = games[gameID];
            game.state = {};

            //make powerups go
            setInterval(() => givePowerups(gameID), powerupTime * 1000)

            //initialize the game state
            for(let b = 1; b <= game.boxes; b++){
                game.state[b] = {color: null, powerup: null, disabled: false};
            }

            // If there is no gameID and the user is not player 1, return
            if (!gameID || player !== 'Player 1') {
                return;
            };
            // If there is more than one client, start the game
            if (game.clients.length > 1) update(gameID);
            const payload = {
                'method': 'start',
                'game': game
            };
        };
        // If the method is play... 
        if (res.method === 'play') {
            // Set the IDs for the game and box, and assign the box's color
            const gameID = res.gameID;
            const clientID = res.clientID;
            const boxID = res.boxID;
            const color = res.color;

            let game = games[gameID];
            let player = game.clients.find(c => c.clientID === clientID);
            let box = game.state[boxID];
            // Assign the state of the game 
            let state = game.state;

            //if the box has a powerup, change the gamestate through the powerup's click handler
            if(box.powerup){
                box.powerup.onClick(state);
            } else {
                box.color = color;
            }

            //if the player  has a selected powerup, give the box a new instance of that powerup, and clear the player's selected powerup.
            if(player.selectedPowerup !== null){
                
                let powerupIndex = player.powerups[player.selectedPowerup];
                let powerupClass = powerupMap[powerupIndex];

                //give the box the powerup
                box.powerup = new powerupClass(boxID, player, game.boxes);
                box.powerup.onUse(state);

                player.powerups[player.selectedPowerup] = null;
                player.selectedPowerup = null;
            }

            //update game state
            game.state = state;
        };

        if(res.method === 'requestPowerup'){
            const gameID = res.gameID;
            const clientID = res.clientID;
            const powerupIndex = res.powerupIndex;

            let game = games[gameID];
            let player = game.clients.find(c => c.clientID === clientID);

            if(player.powerups[powerupIndex] !== null){
                player.selectedPowerup = powerupIndex;
            }
        }
        // If the method is restart...
        if (res.method === 'restart') {
            // Set the game's ID and set the game using the ID
            const gameID = res.gameID;
            const game = games[gameID]
            // If there is no game, return
            if (!game) return;
            // Reset the game's time and frame
            game.time = 30;
            game.frame = 0;
            // Reset the game's state and reset the client's scores
            game.state = {};
            game.clients.forEach((c) => {
                c.score = 0;
            });
            // Create the restart payload
            const payload = { 
                'method': 'restart',
                'game': game
            };
            // For each client in the game...
            game.clients.forEach((c) => {
                // If that client exists, send the stringified payload
                if (clients[c.clientID]) {
                    clients[c.clientID].connection.send(JSON.stringify(payload));
                };
            });
        };
        // If the method is leave...
        if (res.method === 'leave') {
            // Set the game's ID, the client ID, and set the game using the ID
            const clientID = res.clientID;
            const gameID = res.gameID;
            const game = games[gameID];
            // Create the leave payload
            const payload = {
                'method': 'leave',
                'game': game,
                'clientID': clientID
            };
            // For each client in the game...
            game.clients.forEach((c) => {
                // If that client exists, send the stringified payload
                if (clients[c.clientID]) {
                    clients[c.clientID].connection.send(JSON.stringify(payload));
                };
            });
            // If the game's creator is the client, delete the game
            if (game.creator === clientID) delete game;
        };
    });
    // Generate a new client id
    const clientID = guid();
    // Where the client is in the clients object, set the connection
    clients[clientID] = {
        connection: connection
    };
    // Create the connect payload
    const payload = {
        'method': 'connect',
        'clientID': clientID,
        'games': games
    };
    // Send the stringified payload (client connect)
    connection.send(JSON.stringify(payload));
});

// Create a function to update the game by gameID
let update = (gameID) => {
    // Get the game by gameID.
    const game = games[gameID];
    const gameState = game.state
    // If the game does not exist, return
    if (!game) return;
    // Increment the game's frame by 1
    game.frame++;
    // Every 20 frames while the game is running...
    if ((game.frame % 20) === 0 && game.time > 0) {
        // Reset the frames back to 0 and deincrement the time by one
        game.frame = 0;
        game.time--;
    };
    // For each client in the game...
    game.clients.forEach((c) => {
        // Reset that client's score
        c.score = 0;
        // If there is no game state, return
        if (!gameState) return;
        // For boxes of the game's state
        for (const b of Object.keys(gameState)) {
            // Set color to the box's color
            const color = gameState[b].color;
            // If the client's color is equal to the color
            if (c.color === color) {
                // Increment score by one
                c.score++;
            };
        };
    });

    //remove any powerups that are to be removed
    for (const b of Object.keys(gameState)) {
        const box = game.state[b];
        if(box.powerup && box.powerup.toBeRemoved){
            box.powerup = null;
        }
    };

    //cleans any extra data out of the state so just the colors and disabled status are sent to the clients
    const packedState = Object.fromEntries(
        Object.entries(game.state).map(([key, value]) => [key, {color: value.color, disabled: value.disabled}])
    );

    let packedGame = JSON.parse(JSON.stringify(game)); //js really needs to add a feature to explicitely tell it when to pass by reference and by value cuz this is just weird.
    packedGame.state = packedState;

    // Create the update payload
    const payload = {
        'method': 'update',
        'game': packedGame
    };
    // For each client in the game...
    game.clients.forEach((c) => {
        // Stringify and send the update payload
        if (clients[c.clientID]) {
            clients[c.clientID].connection.send(JSON.stringify(payload));
        };
    });
    // Set a timeout to update every 50 milliseconds (1/20th of a second)
    // 20 frames per second
    setTimeout(() => update(gameID), 50);
};

// Create a function to check if a client is in a game taking clientID and method as arguments
let comb = (clientID, method) => {
    // Set combed to false
    let combed = false
    // If the method is create...
    if (method === 'create') {
        // For each game in games...
        Object.keys(games).forEach((g) => {
            // Set client equal to whether or not the game's creator is the clientID
            const client = games[g].creator === clientID;
            // If client is true, set combed to true. Else, don't do anything
            client ? combed = true : null;
        });
    // Else...
    } else {
        // For each game in games...
        Object.keys(games).forEach((g) => {
            // Set client equal to whether or not the clientID is in the game's clients
            const client = games[g].clients.find((c) => c.clientID === clientID) ;
            // If client is true, set combed to true. Else, don't do anything
            client ? combed = true : null;
            });
    };
    // Return combed
    return combed;
};

function givePowerups(gameID){
    const game = games[gameID];
    const powerupNames = game.powerupNames;
    //give all the little kiddies some delicious powerups
    for(const c of game.clients){
        for(let i = 0; i < c.powerups.length; i++){
            const powerupIndex = Math.floor(Math.random() * powerupMap.length);

            // if there's already a powerup in that slot, let em keep it
            if(c.powerups[i] !== null){
                continue;
            };
            c.powerups[i] = powerupIndex;
        };
    };
};

// Create a function to randomly create a hex string 4 characters long. It does this by...
// Get a random number between 1 and 2, excluding 1 and 2, and multiply it by 0x10000 (a hex representation of 2^16) 
// (Results in a number from 131072 to 65536)
// Quickly convert said number to an integer, and then, convert the number to a hex string
// Slice the string to remove the first character and return the hex string
const hex = () => {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
};

// Create a guid (Globally Unique Identifier) by concatenating multiple random hex strings together. Ensure they are all upper case
const guid = () => (hex() + '-' + hex()).toUpperCase();

// For anyfiend that needs a refresher on inklings 👇
// ..........................................................................................................................................................................::::::::::::::....:::::::::::::::....::::::::::::::::::::::::.::::....................................................................................................................................................................
// .........................................................................................................................................................................::::::::::::::::...::...::::::::::.::::::::::::::::::::::::::..........................................................................................................................................................................
// ..........................................................................................................................................................................:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::.::::....................................................................................................................................................................
// ...................................................................................................................................................................:::...::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::.::::....................................................................................................................................................................
// ......................................................................................................................................................................:::::::::::::::::::-------========--------:::::::::::::::::::::::.::::....................................................................................................................................................................
// ...................................................................................................................................................................:::.:::::::::::-======+++++++++++++++++++++++=======--::::::::::::::.:::::...................................................................................................................................................................
// .....................................................................................................................................................................::.:::::-==+++++++++++++++++++++++++++++++++++++++++++===-:::::::::::::....................................................................................................................................................................
// ...............................................................................................................................................::::::::::::::::::::::::::-=++++++++++++++++++++++++++++++++++++++++++++++++++++++==--:::::::::::::::::::::::::::::::::..........................................................................................................................................
// ................................................................................................................................................:::::::::::::::::::::-==++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++==-::::::::::::::::::::::::::::::.........................................................................................................................................
// ................................................................................................................................................::::::::::::::::::-==+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++==--:::::::::::::::::::::::::.........................................................................................................................................
// ................................................................................................................................................:::::::::::::::-==++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++==--:::::::::::::::::::::.........................................................................................................................................
// ...............................................................................................................................................::::::::::::::-=++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++==--::::::::::::::::::.........................................................................................................................................
// ...............................................................................................................................................:::::::::::--=+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++===-:::::::::::::::.........................................................................................................................................
// ...............................................................................................................................................:::::::::--=+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++=--::::::::::::.........................................................................................................................................
// ..................................................................................................................................::::::::::::::::::::-==++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++=-:::::::::::::::::::::::............................................................................................................................
// ...................................................................................................................................::::::::::::.:::::-=+++++++++++++++++++++++++++++++++++++++++++++=++=========+==============++++++++++++++++++++++++++++++=-:::::::::::::::..................................................................................................................................
// ..................................................................................................................................:::::::::::::::::-=++++++++++++++++++++++++++++++++++++++++++++=================================+++++++++++++++++++++++++++++=--::::::::::::::::::............................................................................................................................
// ..................................................................................................................................:::::::::::::::-=+++++++++++++++++++++++++++++++++++++++++++++===========================================++++++++++++++++++++++==-::::::::::::::::............................................................................................................................
// ...................................................................................................................................:::::::::::::==++++++++++++++++++++++++++++++++++++++++++++++===========================================+=++++++++++++++++++++++==-:::::::::::::.............................................................................................................................
// ...................................................................................................................................:::::::::::-=+++++++++++++++++++++++++++++++++++++++++++++======================================================+++++++++++++++++++=-::::::::::::............................................................................................................................
// ..................................................................................................................................:::::::::::=+++++++++++++++=++++++++++++++++++++++++++++============================================================+++++++++++++++++=--:::::::::.............................................................................................................................
// ........................................................................................................:::.:::::::..::::::::::::::::::::::-=++++++++++++++==+++++++++++++++++++++++++++===============================================================++++++++++++++++++=-:::::::::............................................................................................................................
// ........................................................................................................:::.::::::::::::::::::::::::::::::-=+++++++++++++==++++++++++++++++++++++++++=++==================================================================++++++++++++++++=-:::::::.............................................................................................................................
// ........................................................................................................:::::::::::::::::::::::::::::::::-=++++++++++++===+++++++++++++++++++++++++=======================================================================++++++++++++++++++=::::::.............................................................................................................................
// ...........................................................................................................:::::::::::::::::::::::::::::-=+++++++++++======+++++++++++++++++++++++=================================++========================================++++++++++++++++=-::::.............................................................................................................................
// ........................................................................................................:::::::::::::::::::::::::::::::-=++++++++++=========+++++++++++++++++++===================================+++===========================-----========+++++++++++++++++=-:::::.:.::......................................................................................................................
// ........................................................................................................::::::::::::::::::::::::::::--==++++++++++=====---===++++++++++++++++++=+================================++++==========================--::::---=======++++++++++++++++=-::::..::.......................................................................................................................
// ........................................................................................................:::::::::::----------------===+++++++++++====------====++++++++++++++++++++=============================++++===========================---:::::--=======++++++++++++++++=-:::::::.......................................................................................................................
// ........................................................................................................::::::::::---------------====+++++++++++===-----------===++++++++++++++++=+=============================+++==============================--:::::-========++++++++++++++++=-::::::::.....................................................................................................................
// ........................................................................................................::::::::::::------------====+++++++++++===---------------===+++++++++++++==============================++++================================------=========++++++++++++++++=-::::::::::::................................................................................................................
// ........................................................................................................:::::::::::::-----------===+++++++++++===------------------===++++++++++==============================++++=================================================++++++++++++++++-:::::::::::::...............................................................................................................
// ........................................................................................................::::::::.:::::-----------==+++++++++++==----------------------===++++++=================================+===================================================+++++++++++++++=-::::::::::::...............................................................................................................
// ........................................................................................................::::::::::::::::--------==+++++++++++===-------------------------====+++++========================-=========================================================++++++++++++++++=-:::::::::::...............................................................................................................
// ............................................................................................................:::::.:::::::-------==+++++++++++==------------===--------------====+++++=====================-=========================================================++++++++++++++++=-:::::::::::...............................................................................................................
// ........................................................................................................:::....:::::::::::------=++++++++++++=-------------==+==----::-::------====++++=========================---=================================================+++++++++++++++++=::::::::::................................................................................................................
// ........................................................................................................:::.:::::::::::::::----==+++++++++++=---------------=++===--::::::::------======================-===--==----================================================+++++++++++++++++=-:::::::::................................................................................................................
// ..................................................................................................................:::::::::::--=+++++++++++==---==-----------==+===--::::::::::------===================-==---==::--======================+=--=======================+++++++++++++++++-::::::.::................................................................................................................
// .......................................................................................................................:::::::-=+++++++++++==+*#%%#*+--------==+=====--:::::::::::------===============-===--==-:::--=======================--=======================+++++++++++++++++-::::::.::................................................................................................................
// .....................................................................................................................:::::::::-=+++++++++++=+#%%*+=++++=------=========--::::::::::::::--------===========---=--:::---===================------======================+++++++++++++++++-::::::.::................................................................................................................
// .....................................................................................................................:::::::::-+++++++++++=*#%%#=----=*#*+-----==++++===--:::::::::::::::::----------=----::-===--::---=================-------======================+++++++++++++++++-::::::.::................................................................................................................
// .....................................................................................................................::::::::-=+++++++++++=*#%*+-::--**###*=----==+++++==--:::::::::::::::::::::::-----:::::--=======----===============-::--:-======================+++++++++++++++++-::::::.::................................................................................................................
// .....................................................................................................................::::::::-=+++++++++++=#%%+=:::-=***##%#*=---=+++++++=--:::::::::::::::::::::::::::::::::----======================-::::-:--====================++++++++++++++++++-::::::.::................................................................................................................
// .....................................................................................................................::::::::=++++++++**++=#%#+-:::=+***#%%@%#+---==+++++==-:::::::::::::::::::::::::::::::::::::------===============-:::::::--====================++++++++++++++++++-:::::::::................................................................................................................
// .....................................................................................................................:::::::-+++++++++**+=+#%#+-:::=++**%%%%%%#+=--==++++==--::::::::::::::::::::::::::::::::::::::::::------========--:::::::--====================++++++++++++++++++-::::.:::.................................................................................................................
// .....................................................................................................................::::.::-++++++++***==+%%#+-:::+++*#%%%%%%%%*=---==+==----:::::::::::::::::::::::::::::::::::::::::::::::--------:::::::::--====================+++++++++++++++++=-::::.:::.................................................................................................................
// ......................................................................................................................::::::=++++++++***==+%%#+-:::+++**%%%%%%%%%#+=------------::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::--=====================++++++++++++++++=::::::::::................................................................................................................
// ......................................................................................................................:::::-=+++++++****===#%%+=:::=+++*%%%%%%%%%%#*=-------------::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::--=====================+++++++++++++++==:::::...::................................................................................................................
// .....................................................................................................................::::::-=+++++++****===#%%#+--:-=+++*#%%%%%%%%%#*+=---------------:::::::-------------------------:::::::::::::::::::::::---=====================+++++++++++++++=-::::::::::................................................................................................................
// .....................................................................................................................::::::=+++++++*****=--*#%%#=----+++++*##%%%%#**##*=---------------------=========================--:::::::::::::::::::::--======================+++++++++++++++=:::::::::::................................................................................................................
// .....................................................................................................................::::::=+++++++**##*=--+*%%%*+---=++++=++++++++*#%%#+=------------------=++++++=================---::::::::::::::::::::::--======================++++++++++++++=-:::::::::::................................................................................................................
// .....................................................................................................................::::::=+++++****###==--=#%%%#+=--==+++++++++++*#%%%#+=-----------------=++++++++++==++=====---::::::::::::::::::::::::::--======================++++++++++++++=-:::::::::::................................................................................................................
// .....................................................................................................................:::::-=+++++****###+=---+#%%%%#*=====++++++++*#%%%%%%#+=----------------===++++++=====-----::::::::::::::::::::::::::::---======================++++++++++++++-::::::::::.:................................................................................................................
// .....................................................................................................................:::::-=++++*****###+=----=+#%%%%#**++==++++**#%%%%%%%%%#*+=-----------------------------------::::::::::::::::::::::::----=======================+++++++++++==:::::::::::::................................................................................................................
// .....................................................................................................................:::::-=+++*****####*+------++##%%%%%#######%%%%%%###%%%%%%#**+===----======++===++++++*******+++==---:::::::::::::::-----===++++++===============+++++++++++=::::::::::::::................................................................................................................
// .....................................................................................................................:::::-=+++*****#####+=-------===**##%%%%%%%%##*+==--=+*#%%%%%%%#############*+++****##%%%%%%%%%%%##**+==---:::::::-------==+++++++++=+++=========++++++++++=-::::::::::::::................................................................................................................
// .....................................................................................................................:::::-=+++*****#####*+=------------====+++===-----------=+*#%%%%%%%%%%%%%#*====++++*#%%%%%%%%%%%%%%#####*+=----:---------==+++++++++++++++=========+++++++=:::::::::::::...................................................................................................................
// .....................................................................................................................:::::-=++*****#######*=-------------------------------:::::-=+*#%%%%%%%%#*=---=++++*#%%%%%%%%%%%%%%******##*+------------==+++++++++++++++++==+====++++++=-::::::::::::::.:................................................................................................................
// ...................................................:::::::::::::::::::::::::::::::::::::::::::.:::::::.::............:::::-=+******#######*+==-----------------------------:::::::::-=*#%%%%%#+----=++++*#%%%%%%%%%%%%%#*+**+=+#%%*+----------==++++++++++++++++++++====++++++=-::::::::::::::::................................................................................................................
// ...................................................::::::::.:::::::::::::::::::::::..:::::::::::::::::::::...........:::::-=+******#######*++===---------------------------:::::::::::-=#%%%%#+----=+++++*%%%%%%%%%%%%#*++++=-+*%%%#+--------==++++++++++++++++++++++==+++++++=--:::::::::::::::................................................................................................................
// ...................................................::::::::::::::::::::::::::::::::::::::::::::...:::::::..............:::-=+*****########**++=====----------------------::::::::::::::-+*%%%#*=----=+++++*#%%%%%%%%##*++++==-+#%%%%#=-------==+++++++++++++++++++++++++++++++=----:::::::::::::................................................................................................................
// ...................................................::::::::::::::::::::::::-----------::::::::::::::::::::............::::-=+*****#######****++=======-------------------:::::::::::::::-=#%%%#+=----=++++++**#####**+++++=--=*%%%%%#+=------==+++++++++++++++++++++++++++++++==---:::::::::::::................................................................................................................
// ....................................................::::::::::::::::::--======+++++=======---::::::::::::.............::::-=+****#######*******+========-------------------::::::::::::::-=#%%%#+=----==++++++++++++++++==--=*%%%%%%#=------==++++++++++++++++++++++++++++++++==-----::::::::::::...............................................................................................................
// ....................................................::::::::::::::-====++++++++++++=+++========--:::::::::...........::::::=+***#######*********++=============---------------:::::::::::::=+%%%%#+==---==+++++++++++==----+*%%%%%%#+-------==++++++++++++++++++++++++++++++++==-------::::::::::...............................................................................................................
// ....................................................::::::::::::-===++++++++++++++================-:::::::...........::::::=+***######************++==============----------------::::::::::-=*%%%%%#####*********++=====+*%%%%%%%#+=------===+++++++++++++++++++++++++++++++++=---------:::::::................................................................................................................
// ............::::::::::::::::::::::::::::::::::::::::::::::::::-=+++++++++++++++===================+==-:::::::::::::::::::::=+***#####**************++===============--------------::::::::::::-=*#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#*=--------==++++++++++++++++++++++++++++++++++=------------:::::::::::::::::.............::::::::::::.::::::::::::::::::::::..::::.::::::.::::.................................
// ............::::::::::::::::::::::::::::::::::::::::::::::::-=++++++++++++++======================+=====-::::::::::::::::::-=***####****************+++===============-----------:::::::::::::::--=+++*********####%%%%%%%%%%##*==--------===++*+++++++++++++++++++++++++++++++=-------------::::::::::::::::.............::::::::::::::::::::::::::::::::::::::::::::::::.::::.................................
// .............::.:::::::::::::::::::::::::::::::::::::::::::==++++++++++++++========================+=+=+==-:::::::::::::::::=+**####*****************+++++==============--------:::::::::::::::-------------------====++*+++==-----------===++***++++++++++++++++++++++++++++++==-------------::::::::::::::::............:::::::::::::::.:::::::::::::::::::::::::::::::::::::.................................
// .............:.::::::::::::::::::-------:::::::::::::::::-==++++++++++++============================+++++++==-:::::::::::::-=+**####*****************+++++++================------------------===--------------------------------------====++*****++++++++++++++++++++++++++++++=---------------::::::::::::::...........::::::::::::::::::::::::::::::::::::::::::::::::::::::.................................
// ............::::::::::::::::-==++*******+==:::::::::::::-===++++++++++=============================++++++++++===:::::::::::-=++*####***************++**++++++====================================------------------------------------====+++******++++++++++++++++++++++++++++++=-----------------:::::::::::................:::::::::::::::::::---=======---:::::::::::::.::::.................................
// ............:::::::::::::-=+*****#*********+=::::::::::-=+=+++++++++++++++===========------=========++++++++++++====--::::===++**###**************+++***+++=--=++===========================--------------------------------------=====+++++******++++++++++++++++++++++++++++++==-----------------::::::::::.............::::.::::::::::::-==++++*******+++++==--::::::::::::::................................
// ............:::::::::::-=+*********######****--:::::::-==+++++++++++++++++++========--::::--=========+++++++++++++++++=======++**####*******************+++-:::-=++===================-----------------------------------------======+++++*********++++++++++++++++++++++++++++++=--------------::::::::::................::::::::::::::=++*******************+++++=-:::::::::::................................
// ............::::::::::=*************########**=::::::-===+++++++++++++++++++++======--:::::--========+++++++++++++++++++++++++++**###******************+++=-:::::-==+======================---------------------------------=======+++++****#******++++++++++++++++++++++++++++++==--------::::::::::::::::::.......:::....::::::::::=+**********#***********+++++++++-:::::::::::::.:::::::....................
// ............::::::::-+***************########**+:::::==+=+++++++++++++++++++++++=====-:::::--=======++++++++++++++++++**++++++++**###******************+++=::::::::-=+++========================-------------------------=======+++++**###########**++++++++++++++++++++++++++++++==--::::::::::::..::........::::.:::::::::::::::-+********###########******+++++++++++=-:::::::::::::::::::...................
// ............::::::-+******************########**+=::-===+++++++++++++++++++++++++====---:---======+++++++++++++++++++++***++++++***##*****************+++=-:::::::::::-===++=============================------===============++***################**+++++++++++++++++++++++++++++=::::::::::::::............::.::::::::::::::::=+*###*****###########*********+++++++**++=-:::::::.:::::.:::...................
// .............::::=+*******************########***+======++++++++++++++++++++++++++======-========+++++++++++++++++++++++***+++++**##******************+++=:::::::::::::::-+++++++++=========================================--=+####################*++++++++++++++++++++++++++++++-:::::::::::::............::.::::.::::::::-+***###*****###########***********+++++******+=-:::::::::::::::...................
// .......::::.:::-=+********************########******++=++++++++++++++++++++++++++++===============++++++++++++++++++++++***++++++********************+++=-::::::::::::::-+*******+++++++++++++++++++++++++++++++++*+=--:::::::::-+##%%%##############*+++++++++++++++++++++++++++++=-:::::::::::.............:::::::::::::-=+******######**##########************++++********+=-::::::::::::....................
// .......:::::::-+******###****++*******#######*********+++++++++++++++++++++++++++++++============+++++++++++++++++++++++++*++=+++++******************++=-:::::::::::-+*#*******************#########%%%%%%####******+=::::::::::::-+#%###############**+++++++++++++++++++++++++++++=::::::.::::.............:::::::::::-=+********#####**##########***************************+=-:::::::::::...................
// ......:::.:::-=*******##****++++******#######**********+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*++===++++++***************++=:::::::-+**##%%%##***********###%%%%%####%@@@@%%##***********+-::::::::::::::=*###############*+++++++++++++++++++++++++++++=-::::::::::.............:::::::::-=*******########***########*******************###********++=::::::.::....................
// ........:::::++**********************#######*************+++++++===---==+++++++++++++++++++++++++++++++++++++++++++++++++++++===++++++++*************+=-:::::=*#####%%@@@%%%%#####%%%%@%%#****#%@@@@%##***********#***++=====+++=-:::::-+*############**++++++++++++++++++++++++++++++-::::::::::..........::::::::::=+*******########***########**#***++++++******######*********+=-::::::::...................
// ::..::::::::-************************#######**************++=======------=++++++++++++++++++++++++++++++++++++++++++++++++++=====++++++++************+-::::=*%###*#%%@@@@@@@@@@@@@@@%%#*+++**#%@@@%#****+++++++++**##**********###*+-:::::-=+***********++++++++++++++++++++++++++++++=-:::::::::::::::..::::::::::-+*******#########***#############**++==+++****#########********++::::::::...................
// ::..:::::::-=*********##************#######****************+=======--------=+******+++++++++++++++++++++++++++++++++++++++++=-===++++++++++*********+=-:::=#%##***##%@@@@@@@@@@%%%#**++==++*#@@@%#***++++++++++++++**#****##########*-:::::::::::-------+++++++++++++++++++++++++++++++=:::::::::..::.:::::::::::-=+*******########***################**+===++**############********++-:::::....................
// ::.::::::::=*********####*********########******************+=======-----=++*##********+++++++++++++++++++++++++++++++++++++=--==++++++++++++*******+-:::=%####*****##%%%%%###**+++=====++*%@@@%#***+++++++++++++++++*##**#%%%%#%%%%%#*=-:::::::::::::::==++++++++++++++++++++++++++++++-::::::.::::::::::::::::=+********############################**++==++**#############*********+-:::::...................
// :::::::::::+********************##########*******************++====-----**####************+++++++++++++++++++++++++++++++++=---===+++++++++++******+=:::+*###************++++++++++====++*#@@@%***++++++++++++++++++++*#***#%%%%%%%%%%%%#*=::::::::::::::=++++++++++++++++++++++++++++++=-::::::::::::::::::::-+*******###############################***+===++***#############********+-:::::..................
// ::::::::::-+##****************###########*********************+====---==*#####**##%#**********++++++++++++++++++++++++++++==---====+++++++++++*****+=::-####******++++++++++++++++====++*#@@@#****+++++++++========+++**#**##%%%%%%%%%%%%%#=:::::::::::::-+++++++++++++++++++++++++++++++=-:::::::::::::::::-+********#################################**++==++****############*********+=::::::::..............
// ::::::::::-*###*************###########***********************+====---=+######**##%##************+++++++++++++++++++++++++=---=====+++++++++++**+***+:=*##*******++++++++++++++++=====+*#%@@%****+++++++==============+****##%%%%%%%%%%%%%%#+-::::::::::::-++++++++++++++++++++++++++++++++-::::::::.::::::=+********################################*#***+++******#############*********+-::::.:::.............
// ::::::::::-+####********#############*************************+====---=*#####*****#****************++++++++++++++++++++++=----======++++++++++**+******##******++++++++++++++++======++*@@@%#****+++++======---------==+***##%%%%%%%%%%%%%%%#*-::::::::::::++++++++++++++++++++++++++++++++=-:::::::.::::-+********##############################*#****************##############********++-::::................
// :::::::::::+############%%%%########**************************+===----+*#####*************************++++++++++++++++++==---========+++++++++**+**#####******++++++++++++++=========+*#@@%#*+***+++====-------::::---==***##%%%###########%%%=::::::::::::-=+++++++++++++++++++++++++++++++=:::::::::::-+***#****#############################*#********************#############********+=::::::::::::::......
// :::::::::::=*#####################***************************++==----+*#####******************************+++++++++++++==----========+++++++++**+**####******++++++++++==============+*#%%#*++**+++===----::::::::::::--++*##%%%##############=:::::::.:::::-++++++++++++++++++++++++++++++++=-::::::::-*********#####################***#######**************++++***###############*******+=:::::::::::::......
// ::::::::::::=################****######*************#####***++==---==*#####****************+++++*************+++++++++==----==========+++++++++++*#####******++++++============----==+++*+++++**++==---::::::::::::::::-=+*#%%%%%%##########**-:::::::.::::::=++++++++++++++++++++++++++++++++=-:::::-=*********##################***************************++++++***##############********=::::::::::::.......
// :::::::::::::=+*######*********#############****#########**++==----+*#####****************+=---=+**************++++++==----===========++++++++++**#######%%##++*****++====----------=++++++++***+==---::::::::::::::::::-=*#%%%%##%%%######**+--::::::.:::::::=++++++++++++++++++++++++++++++++=::::-+*********###################**************************+++===++**###############*******+-:::::::::::.......
// :::.:::.:::::::-=+**********############################***+==---=+*#####***********+****+=------=+*************++++=----=============++++++++++**####%%@@@%#+*#%%%%#*=--------------=+******#**+=---:::::::::::::::::::-=*%%%%############*+=---:::...:::::::-=++++++++++++++++++++++++++++++++=--++*********####################**********************++++++++=++***#############*****++++++-:::::.::::.......
// ::.:.:::::::::::::::--=++**############################**++==--==+*#####**********+==+**+==--------+*****##******++==---==============++++++++++**###%%%@@@#*+*%@@@@#+=--------=**+=--=+#%%%%%#+==============---===---:-=*#%%%#####%%###*+=------:::::::::::::-+++++++++++++++++++++++++++++++++++*********###################************************+++=====+++****#*##########*******+++++-::::::..::.......
// ::.::::::::::::::::::::::::--==+**####################**+======+*#######**********+==+****+=--------=+**##%##***++==--================++++++++++*####%%@@@%#*+#%@@@%#+==-----:=+%%%##*+=+*%@@%*++++++====-----------=====+#%%%###%%#####*+=--------:::::::::::::=+++++++++++++++++++++++++++++++++++*******###########***********************************++====++*****###########********++++*=:::::::..........
// ::.::::::::::::::::::::::::::::::=*#################**++=====+*#######***********+=++***###*+=-------=++##%%#***+======================+++++++++*####%%@@@%***#@@@@@%%%###**+-+*%%%%%%*=--+*##**+++====--------------=+*+*%%%%%#%%%###*+=-----------:::::::::::::-+++++++++++++++++++++++++++++++++++****#############**************************++++++++**+++++*********#########*********+++*=-:::::::::.......
// ..........................:::::::-*#####***********++=====++*########***********++=++**###%%#*+=--------+*###*++====+++================++++++=++######%%@@%***%@@@@@@@@@@@%%*=+#%%%%%%+-:::-=***++====----------------+**##%%%%###%##*+--------------::::::::::::-=++++++++++++++++++++++++++++++++++++**##############*************************++++=====++++**************######**********++*+-:::::::::.......
// .........................::::::::-+*######*+++++++++++++***#########*****###****+++***#####%%%#*+=--------=+**+++===++=================++++===+*######%%@@%***%@@@@@@@@@%%@#+=*%%%%%%*=-----=++++===-----------:-----=+*#%%%%%%####*+--:::-----=-------::::::::::::=++++++++++++++++++++++++++++++++++++***###########**************######**********++++=====++*************#####*************+=:::::::::.......
// .........................::::::::::*#########**********###########******###*****+****#######%%%%#+=----------===+====+==+=============++++===+**########%@%#**%@@@@@@@@@@@%*++#%%%%%%+----==+*++====--------:::::----=*#%%%%%%%#**=---:::::--+++=-------:::::::::::--++++++++++++++++++++++++++++++++++++++***####*******************#####**************+++++++***************####************+=:::::::::.......
// .........................::::::::::=+############################*****###***********########%%%%%*+=------------=====*+===++++++====+++++===+**#########%%%#**%@@@@@@@@@@%%++*#%%%%%#=-----=+*+===---------::::::----+*##%%%%#*+---::::::::-===-==--------:::::::::::=++++++++++++++++++++++++++++++++++++++++*****************************************************************###************+=:::::::.........
// .........................::::::::::::+*#################################**********####*#####%%%%%#*==----------------===---==+++++++++++===+*###########%%%#**%@@@@%%#%%%%%++*%%%%%##------=+*+===--------:::::::---=+#%###**=--:::::::::::::-::--=--------:::::::::::=*++++++++++++++++++++++++++++++++++++++++****###########************************************************###************++:::::::.........
// ..........................::::::::::::=+##############################**********################%%#+=-------------::---------==++++++++==++**#########*##%%#**#@@@@#+=+#%%%++#%%%%%#*------++++===--------:::::::---=*###*=--:::::::::::::::::::::-==-------::::::::::-=+*+++++++++++++++++++++++++++++++++++++++++****##########************************************************##************+:::::::::.......
// ..........................::::::::::::::=+*##*######################**********###############***#%%*+=----------::::::::-------==+++++==+**##############%@##*#@@@@#+=*#%%#+=++++++==::---=+*+====-------::::::::--=+**+=-::::::::::::::::::::::::-=+=-------:::::::::::++++++++++++++++++++++++++++++++++++++++++++++**********#*************************************************####********++:::::::::.......
// ......................................:::-***#####################**********###############****##%%*+=----------:::::::::::------===++++*###########*##%#%@%#+#%@@@#+=+#%%%%#######+=----=+**+==---------:::::::---===--:::::::::::::::::::::::::-=++==-------:::::::::::-++++++++++++++++++++++++++++++++++++++++++++++++++******************************************************#*#*********+=:::::::::.......
// .......................................:::=+**#################**********#################****###%%*+==----------::::::::::::-----====+*##############%%#%@%#+#%@@@#+=+#%@@%%%%%%%%+=----=+**===--------::::::::-----::::::::::::::::::::::::::::-=---==--------::::::::::=+*++++++++++++++++++++++++++++++++++++++++++++++++++***************************************************************+=:::::::.........
// .......................................::::=+****##########**********###################******##%%%*+==--------------:::::::::------===++**##########%%%#%%%%**#%@@#*=+#%@%%%%%%%%%=----=+**+===--------:::::::------:::::::::::::::::::::::::::::::::--=--------::::::::::-=++++++++++++++++++++++++++++++++++++++++++++++++++++++***********************************************************+=:::..:::........
// .......................................:::::-+********#################################*****###%%%%*+===---------------:::::::--------===++**######%%@@%##%%%**#%@@%*=+*%@%%%%%####=-:--=+**+==---------:::::::-----::::::::::::::::::::::::::::::::::::-==-------:::::::::::=++++++++++++++++++++++++++++++++++++++++++++++++++++++++********************************************************=-::::::::........
// .......................................:::::::-=******###############################******###%%%#*+====---------------------------------===++**#%%@@@@%%#%%%***%@@%#==+%%@%%%##***=-:--=+*++==--------::::::::-----::::::::::::::::::::::::::::::::::::=++=-------:::::::::::-=++++++++++++++++++++++++++++++++++++++++++++++++++++++++******************************************************=::::::::::.......
// .......................................::::::::::-==+***#######**####%%###%%#################%%%#++===---------------------------------------===*#%%%%%%%%#%%#**%%@%#+==****+++====----=++*+==--------::::::::-----::::::::::::::::::::::::::::::::::::-+=-==--------:::::::::::=++++++++++++++++++++++++++++++++++++++++++++++++++*++++++****************************************************=:::::::::::......
// ......................................::::::::::::::::::=+***++====++*#%%%################%%%%*+====--------------------------------:::::::--------===+++++***++***+==-------------:---=+**+=---------::::::::-----:::::::::::::::::::::::::::::::::::::::::-=--------:::::::::::-+++*++++++++++++++++++++++++++++++++++++++++++++++**+++++++************************************************+-:::::::::::......
// ...................................................::::::-+++===-----=+*###################*+=---------------------------------------:::::::::::::::------------------------------:::--=+**+=---------:::::::---------:::::::::::::::::::::::::::::::::::::::--=:------::::::::::::-++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++*****************************************+-::::::::::.......
// ...................................................::::::::=++==--------+*###########**+==--------------------------------------------------:::::::::--:-------------------------------=+**==--------::::::::---===++++++=======-=-----:::::::::::::::::::::::-==-------:::::::::::::=++***++++++++++++++++++++++++++++++++++++++++++++++++++++++++++***************************************+=:::::::::::.......
// .....................................................:::::::-===----------=++*****+==----------------------------------------------------------------------------:---:::::::::::::------=++==-------::::::::----++*****************+++++=======------::::::::-=+==--------:::::::::::::-++****++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++**********************************+::::::::::::.......
// ....................................................::::::::::-==----------------------------------------------------------------------------------------------------:::::::::::::::::::-----------::::::::----=+****++++*****************++++++++++++==--:::---:-=--------::::::::::::::-=+*****+++++++++++++++++++++++++++++++++++++++++++++++++**+++++++********************************+=:::::::::::::......
// ...................................................::::::::::-====------------------------------==============-============-----------------------------------------------:::::::::::::::::--------::::::::---==+****++++++****************++++*********+++===-:::-==:-------::::::::::::::-=+*****++++++++++**++++++++++++++++++++++++++++++++*********++*********************************=::::::::::::::......
// ....................................................:::::::::--===-----------------------==============================================---------------------------------------::::::::::::::------:::::::------==+***+++++++*****+++*******++++++++*****++++++++======-------:::::::::::::::::=+*****++++++++****++++++++++++++++++++++++++++++*******************************************+-::::::::::::::......
// ...................................................::::::::::::-====----------------============================================================---------------------------------::::::::::::----:::::::--------==++*+++++++++++++++++****+++++++++++++*+++++++++++++++==------:::::::::::::::::-=*****++++++++++++++++++++++++++++++++++++++********************************************+-::::::::::::::.......
// ....................................................:::::::::::-++===-----================-=======================++++++++++++++======+++============----------------------------------::::::::::::::::-----------=++*+++++++++++++++++++++++++++++++++++++++++++++++++++++==---:::::::::::::::::::=+******+*++++++++++++++++++++++++++++++++********************************************=:::...:::.............
// ....................................................::::::::::-=++*+++===========-==-----=-===============+++++++++++++++***+++++======++++=================--------------------------------::::::::::---------:---==+**+++++++++++++++++++++++++++++++++++++++++++++++++++++=---:::.:::::.....::::::-++********+++++++++++++++++++++++++++++*******************************************=-::....................
// ...................................................:::::::::::-=+++******++++++++=========++++++++========++++=========++++*+++++++++===++++++==+++***++========--------------------------------::::----------::::---=++*+++++++++++++++++++++++++++++++++++++++++++++++++++++=---:::::::::...::::::::::==+***************************+++**********************************************=::::....................
// ...................................................:::::::.:::-+++++********************++++++++++=========================++**+++++++==++++++++++**####**+++=========---------------------------------------:::::::--=+++++++++++++++===++++++==============++++++++++++++++++==---:::::::::::::::::::::::-=++***********************************************************************=:::::....................
// ...................................................:::::::::::=++++********************++++++++++=====-=====================+****+++=====+++++++++***###****++++++===========-------------------------------::::::::::--++++++++++++++========================++++++++++++++++++==---::::::::::::::::::::::::::-=+******************************************************************+-::::::....................
// ....................................................::.:::::::=++++***************#***++++++++========-=--======+++========++****++=======+++++++****###*****+****++++++================-------------------:::::::::::::-=+++++++++++++=========================++++++++++++++++++=---:::::..:::::::::::::::::::::-=+**************************************************************=-:::::::....................
// ......................................................::::::::=+++******************++++++++=====--::---=--=====++****+++++++++*+++========++++++****###********++++******+++++++++==============-----===--::::::::::::::--=++++++++++++==========================+++++++++++++++++=----:::::.:::::::::::::::::::::::-=**********************************************************+-:::::::::....................
// ....................................................::::::::::=++***************#**++++++====--:::::::--==========+++*++++++++++++=========+++++******##*****++++++++++++++*************+++++++==========-:::::::::::::::::--++++++++++++===========================++++++++++++++++=-===-:::::::::.........:::.::::::::-++****************************************************+-::::::::::::...................
// ....................................................::::::::::-++*****************+++++===--:::::::::::--===========++++++++++==++=========++++++***********++++++++++++++++++++++++**************++++==-::::::::::::::::::::-==++++++++++=============================++++++++++++++===+=-::::::..................::.:::::-=+++********************************************+=-::::::::::::::...................
// .......................................................:::::::-=+***************++++===-::::::::::::::::--===----------=========++==========+++++**********++++++++++++++++++++++++++++++++++++++++++==-::::::::::::::::::::::--=++++++++++=====================---==========++++++++++=+*+-:::::..................::.::::::::--==++++++++****************************+++==-::::::::::::::::....................
// ....................................................::::::::::-=+*************+++==--::::::::::::::::::::--------------------===+++=========++++++*********++++++++++++=======================++======-::::---:::::::::::---=+****+++++++++=======================---===========++++++++***+=::::....................:::::::::::::---===++++++=====================---::::::::::::::::::::::....................
// ....................................................:::::::::::-+***********++==--::::::::::::::::::::::::---------------------==+++=======++++++++++++++*++++++++++++===============================-----=--=-::::::-=+***++*##%#*+++++++++++++++================----==============++++++++=-::::::.::..................::::::::::::::::----:::::::::::::::::::::::::::::::::::::::::::::::....................
// ....................................................::::::::::::++********+==-::::::.:::::::::::::::::::::---------------------==+++===============++++++++++++++++++====================================--:--=---=**##%%%#**+**%##*++++++++++++++++===============-----===============+++=----:::::.::......::::........:::::::::::::::::::::::::::::::..::::::::::::::::::::::::::::::.::.....................
// ....................................................::::::::::::-=+****+=-:::::::::::::::::::::::::::::::---------------------====+++========--====+++++++++++++++++===============================+=--:::::-===+*#%%%%%%%%##*+**#%#*+++++++++++++++=================-----================+=----:::.::.......::::........::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::...................
// ......................................................:::::::::::::--:::::::::::::::::::::::::::::::::::-------::::-:---------===++++========---=====+++++++++++++++===========================---==+=-::::::-=+*##%%%%%%%%%%**+**#%%#*++++++++++++++=================-----==================----:::::::::::::::::::.::.::::::::::::::::::::::::::::::::..:::::::::::::::::::::::::::::::::::...................
// ................................................................::::::::::.................::::::::::::::::::::::::::::::::----===+++=======-----====++++++++++++++================-------------:::-=+===---=+**##%%%%%%%%%%%#**+**#%%#**+++++++++++++=================-----==================----::::::::::::::::::.::.:::.....................................................................................
// .................................................................:::::::...................::::::::::::::::---------------------====+======------====+++++++++++++=============--------------:::::::-+++=++*##%%%%%%%%%%%%%%%%#*++**#%%#**++++++++++++++================-----===================--========-:::..................................................................................................
// .................................................................:::::::....................::::::::::::::----------------------===========------=====+++++++++++===========-------------:::::::::-=*##**##%%%%%%%%%%%%%%%%%%%##+++*#%%%##*++++++++++++++================------============++******######**=-:::::::::..........................................................................................
// .................................................................::::::.....................::::::::::::----------------------============-------=====+++++++++++========-------------:::::::::-+*#%%@%%%%%%%%%%%%%%%%%%%%%%%%##*++**%%%%#**++++++++++++++================------======+++++**###***########*+::::::::::.:::.....................................................................................
// ...........................................................................................:::::::::::::---------------------------======------========+=====+++=========-------------::::::-+*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#*+++*#%%%%#***+++++++++++++=================-----=====+*+++***###***#########+=::::::::::::.....................................................................................
// .................................................................:::::::...................::::::::::::::------------=======--------=====-----=========-::::-+++========-------------::::-=*#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##*+++*#%%%%%*+++++++++++++++++================----======+++++****##############=::::::::::::.....................................................................................
// .................................................................:::::::...................:::::::::::::--------====+++==++==--------=====-========--:::::::-+++========----------------+*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##++++*#%%%%%*+++++++++++++++++==================+==-=====+++***#######***#####*=::::::::::::.....................................................................................
// ...........................................................................................:::::::::::::-----========-----=------------=======----:::::::::::++==========------------+*#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#*+++**%%%%%%*==++++++++++++++++=============+++++++=======+*####**++======+*#*=-::::::::.:::.....................................................................................
// ...........................................................................................::::::::::::::------------------------------=------:::::::::::::::============--------==*#%%@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##%#%%%%#*+++**%%%%%%*=:==+++++++++++++++=========++*++++++++===++*****+==----------=+=:::::::::.::::.....................................................................................
// ..........................................................................................::::.::::::::::::----------=-------------------:::::::::::::::.:::-=============----=+*#%%@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#####%%%%#**+++*#%%%%%%+-::-=+++++++++++++++=====++******+++++******++==---------------::::::.:...:::::.....................................................................................
// ..........................................................................................::::.::::..::.:::::::--=======--------------::::::::::::::::::::::-===========-===+*#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%######%%%%#*+++*##%%%%%%=::::-=+++++++++++++++++++***#******+*****+==---------------===-:::........:::::.....................................................................................
// ...........................................................................................:::.........:::::::::--==========----------:::::::::::::::::::::::--=========++*#%%%@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%######%%%%**+++*#%%%%%%#=:::::-=++++++++++++++*************##**+==------------=========-::...................................................................................................
// ...........................................................................................:::.::::::::.:::::::::::-===========------::::::.::::::::::.::::::------==+*#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%######%%%%#**++*##%%%%%%*-::::::-=+++++++++++*###*******####*+==-----------============-::::..................................................................................................
// ..........................................................................................::::.:::::::::::::::::::::::-=============-::::::.:::::::::::::::::---=+*#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@%%%%%%%%%%%%%%%%####%%%%%##*+++*#%%%%%%#=:::::::---=++++++***#####*****###*+=-----------==============:::::.........:::::.....................................................................................
// ................................................................................................................:::.::::--======---::::::::..::::::::::::::::-+#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@%%%%%%%%###***++++++++*****+++**%%%%%%%*:::::::::---=+++**##############*+==---------===============-::::::...................................................................................................
// .................................................................................................................:::::::::::::::::::::::......:::::::::::::::=*%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@%%%%%##*+==----------------===+*#%%%%%%*=:::::::::::--=+**#############*+==-------=================-:::::::....................................................................................................
// ...............................................................................................................:.....::::::::::::::::::::::....:::::::::::::-*#%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@%%#*+=-----------:::::--------=+*#%%%#=-::::::::::::-=*############**+==------==================-:::::::::::..................................................................................................
// .................................................................................................................::..:::::::::::::::::.::::::...:::::::::::=+%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@%%#+=---------:::::::::::--------=+*%#*-:::::::::::::=+############*++=========================-:::::::::::::..................................................................................................
// .....................................................................................................................::::::::::::::::....::.....::::::::::-+#%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@%#+=--------::::::::::::::--------=+#+=:::::::::::::-*#%%########**+=========================-::::::::::::::...................................................................................................
// .....................................................................................................................:::::::::.::::::.......:::::::::::::-+*#%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@%#+-------::::::::::::::::::-------=+-::::::::::::::+*#%%%######**++======================--::::::::::::::::...................................................................................................
// ...................................................................................................:::::::::.....:...:::::::::..:::::::.....::::::::::::-=*#%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@%*=-----::::::::::::::::::::---------::::::::::::::-*###%%%%%##**+++++==+===============-:::::::::::::::::::...................................................................................................
// ...........................................................................................:::.::::::::::::::::::::::::::.::::.:::::............::::::::=+##%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@%*=:-----::::::::::::::::::::::-------::::::::::::.::-*#%###%%##**+++++++=====+========-:::::::::::..............................................................................................................
// ...........................................................................................:::::::::::::::::.:::::::::::::::::::::::............:::::::-+*#%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@%*::::---:::::::::::::::::::::::-------:::::::::....:::-*%%%##%##*++++++========+====-::::::::::::................................................................................................................
// ..........................................................................................::::::::::::::::::.::::::::::::.:::::::::.............:::::::-+*%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@%*=::::::--:::::::::::::::::::::::------::::::::::....::::-=######**+++++==========--:::::::::::::::................................................................................................................
// ..........................................................................................::::::::::::::::::::::::::::::::::::::::::............:::::::=*#%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@%#+::::::::--:::::::::::::::::::::::-----::::::::::::::.::::::=++**+====+++=====--::::::::::::::::::::................................................................................................................
// ...........................................................................................::::::::::::::::::--------=--::::::::::::............:::::::-+*%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@%*-:::::.:::--::::::::::::::::::::::::----::::::.:::::::.::::::::::::::::::::::::::::::.::::::::::...::................................................................................................................
// ...........................................................................................:::::::::::::===+++++**#######**=-:::::::.............:::::---+##%%%%%%%%%%%%%%%%%%%%%%%%@%%%#+:::::::.:::-:::::::::::::::::::::::::----::::::::::::::::::::::::::::::::::::::::::..:::::::::::::.:::................................................................................................................
// ...........................................................................................:::::::::-=+++++***####****######*+-:::::::.........:::::::----=*#%%%%%%%%%%%%%%%%%%%%%%%%@%#-::::::::::::::::::::::::::::::::::::::---:::::::::::::::::::::::::::::::::::::::::::::::::::::::::..:::................................................................................................................
// ..............................................................................::::......::::::::::-++********###*****#########*+-:::::::::.:::::::::::-----=+#%%%%%%%%%%%%%%%%%%%%%@%%*=:::::......::::::::::::::::::::::::::::---:::::::::::::::::::............::.....:::::........::::::.....................................................................................................................
// ..............................................................................::::......::::::::-=+*********##*******##########*+-::::::::::::::::::::-------=+#%%%%%%%%%%%%%%%%%%%%%*-::.::.:.....::::::::::::::::::::::::::::--:::::::::::..::::::............................................................................................................................................................
// ..........................................................................................:::::-+++****************########%#####+-::::::::::::::::::::-------==+*#%%%%%%%%%%%%%%%%#*::::::::......::::::::::::::::::::::::::::--:::::::::::....................................................................................................................................................................
// .....................................................................................:.::.::::-++*++**************###%%%%%%%%%%##**-::::::::::::::::::----------==++*#%%%%%%%%%%%%#-:::..:::.:.....::::::::::::::::::::::::::::-::::::::::::::::::::...::.......................................................................................................................................................
// .......................................................................................::::::-+*+++********++***###%%%%%%%%%%%%%%##=-::::::::::::::::------------====++**##%%%%%#+-:::..............:::::::::::::::::::::::::::-::::::::::::::::::::...::.......................................................................................................................................................
// ..............................................................................::::....::::::-+++++********+++**###%%%%%%%%%%%##**++=-::::::::::::::::------------========++++*++-:::::::............::::::::::::::::::::::::::::::::::::::::::::::::...::.......................................................................................................................................................
// ..............................................................................::::...:::::::-+++**********++**##%%%%%%%%%##*+=------------:::::::::::------------==========+++-:::::::::...........::::::::::::::::::::::::::::::::::::--:::::::::::...::.......................................................................................................................................................
// ..............................................................................:::::::::::::-=++++********++**###%%%##***+==------------------:::::::--------------===========-::::::::::............::::::::::::::::::::::::::::::::::::::----:::::::::::::::::::::::::.........................................................................................................................................
// ..............................................................................::::::::.::::=+++++*******+++**##%%#***++==--------------------::::::--------------===========-:::::::::...............:::::::::::::::::::::::::::::::::::::::-----::::::::::::::.:::::::.........................................................................................................................................
// ..............................................................................:::::::::::::=++++++******+++**##%#**+++=------::::-----::::::::::::---------------==========::::::::::::..............:::::-::::::::::::::::::::::::::::::::::-------:::::::::::::.::::..........................................................................................................................................
// .............................................................................::::::::::::::=++++++******+++**##%***++==-----::::::::::::::::::::----------------=========-:::::::::::::.............::::::::::::-----------------::::::::::-----------:::::::::::::.::..........................................................................................................................................
// .............................................................................:::::::::::::-=++++++******+++**###***++==-----:::::::::::::::::::---------------=-=======-::::::::::::.:::............::::::::--------------------------------------------:::::::::::::...........................................................................................................................................
// .............................................................................:::::::::::::-=+++++++*******+**###****++=---------:::::::::::::------------------=======-:::::::::::.:::::............::::::::----------------------------------------------:::::::::::...........................................................................................................................................
// .............................................................................:::::::::::::=++++++++*******+**####****+==---------------::::------------------=======-:::::::::::::::::::...........::::::::::----------------------------------------------:::::::::::..........................................................................................................................................
// .............................................................................::::::::::::-=+++++++********++*#####****++==---------------------------------========-::::::::::::::::::::...........:::::::::::-----------------------------------------------:::::::::::::::::::::::::::::::::::...::::::::::...................................................................................................
// .............................................................................::::::::::::-++++++++*********++*######****++==-----------------------------========-:::::::::.........................::::::.:::::-------=--------------------------------------::::::::::::::::::::::::::::::::::::.::::::::::...................................................................................................
// .............................................................................::::::::.:::-++++++++*********++*##%%#####***++==------------------------==========-::::::::::.........................:::::::::::::::----=-==----------------------------------=====-:::::::::::::::::::::::::::::::..:::::.......................................................................................................
// .............................................................................::::::::.:::-++++++++*********++*##%%%%%%%######**+==--------------=============--::::::::::::.........................::::::::::::::::::::---=-====---------------------==========-=========++=-:::::::::::::::::::.....:::::::...................................................................................................
// ..............................................................................:::::::::::-++++++++****++++**++*######%%%%%%@%@%%##*+==------===============-:::::::::::.:::........................:::::::::::::::::::::::::--=================================---:-=+++++**++++-::::::::::::::::....::.:::::...................................................................................................
// ..............................................................................:::::::::::-+++++++***+++=++**++**########%%%%%%%@@%%%#*+=================--::::::::::::.:::.........................:::::.::::::::::::::::::::::--=================+++==-==+**++++=---=++++***+***+:::---===--::::::::::....::...................................................................................................
// ..............................................................................:::::::::::-++++++****+====+*****##*****######%%%%%%%%%%##*+============-::::::..::::::::::::............................:::.::::....:::::::::::::::--===========+++*+=--=++=++=-=*+---=++++********+++++++*****=-:::::...........................................................................................................
// .............................................................................::::::::::::=++++++***++=--=+#**########################%%%%*-::------::::::::::::::::::::::::.........................:::.:::...::::..::::::::::::::::::-=====++++***++==+*+=++**++=---=+++*****+++++++++****#####--::::::::::::..................................................................................................
// .............................................................................:::::::::::-=++++++***++==-=+######%%%##########%%%%%##%%%%%+::::::::::::::::.:::...............................................................::::::::::::-=++++****++==-=+++++=======+++**************++++***##%*+::::::::::::..................................................................................................
// .............................................................................:::::::::::==++++******+=+++*%%%###%%%######%%%%%%%%%%%%%%%*=::::::::::::::::.::................................................................::::::::::::--+++++++++++=======++++++++********####%%%%#=::::::-==++=-::::::::::..................................................................................................
// ................................................................................::::::::=+++++*******++=##%%%###%%%%####%%%%%%%%%%%@%%%%#+=--:::::::::::::.::.................................................................::::::::-==+++++++++++**************++*##########***###%+=:::::::::-+==:::::::::..................................................................................................
// .............................................................................:::::::::::=++++***********#############%%%%%%%%%%%%%%%%%%%%%##**+=::::::::::...................................................................:::::::::=***+++****#######*****+**%####%%%%%%%%%%%%###**++===--:--=+*++:::::::::..................................................................................................
// .............................................................................::::::::::-=+++***********###############%%%%#%%%%%%%%%%%%%####%%##*=::::::::....................................................................:::::::-=+***########****##*****########*###***##%%@@%%#**+++==+++**+=-::::::::...................................................................................................
// ..............................................................................::::::::-=++++*******++*#%%%%%%%%%%%%###%%%%%%%%%%%%%%%%#*-:::--+*##+:::::::...................................................................::::::::==++++###****##%%##**************++++++++*##%@@@%%#*+=-::::::::::::::::::..................................................................................................
// ..............................................................................::::::::-++++++****+++*#%%%%%###########%%@@@@@%%%%%%%%%##*=::::::-=*-::::::::..................................................................::::::-==++++***##%%%%#***##%#****************++++***#%%%%%#*=-:::::::::::::::::..................................................................................................
// ..............................................................................::::::::-+++++****++=*#%%%######*****###%%%%%%%%%@@@%%%%%%%##+=::::-==-::::::::.................................................................:::::::=++**##%%%####***##%#**+++++++++++++++++++++++++*##%%#*+-:::::::::::::::...................................................................................................
// ..............................................................................:::::::-=++++****++++*########******##%%%%%%%%%%%%@@@@@@@%%%%%#*=::-===::::::::.................................................................:::::::-=+**####*******##***********+***++++++++++++++++**##%#*=-:::::::::::::::..................................................................................................
// .............................................................................::::::::==++******++++**#####******##%%%%%%%%%%%%%%%%%%%%%%%%%%%#**+++--::::::::.................................................................:::::::::::-+********########*****++++*****####****++++***#####*+=-:::::::::::::..................................................................................................
// .............................................................................::::::::=+++*******+++*#####****###%################%%%%%%%%%%%%#*+*+-::::::::::.................................................................::::::::::::=+**++**####***+++++++++++++++++++++**+++++++****#####*+-::::::::::...................................................................................................
// .............................................................................::::::::===+++++++++++**###***#%%#################################*++=::::::::::................................................................:::::::::::::-+*++**####****####***********+++++++++++++++++++**#####*--::::::::...................................................................................................
// .............................................................................::::::::+===+++++++++++*++*#####################************###*###++=:::::::::::...............................................................:::::::::::::=+++**#####***####***+****************+++++++++++**********-:::::::...................................................................................................
// .............................................................................::::::::+====++++++++++++*##****************************************=::::::::::::...............................................................:::::::::::::-=++***##*******++++++++++++++++++++++++++++++********####**=-:::::::::::::::::::.....................................................................................
// .............................................................................::::::::==+==++++++++=++****++++++++++++++++++*****++++++***********+-::::::::::.................................................................::::::::::::-=+***#*******+++++++++++++++++++++++++++++++++++*********#***--:::::::::::::::::.....................................................................................
// ..............................................................................:::::::-=+=+==========+++++==+++++++++++++++++++++++++++++**********+::::::::::.................................................................:::....::::::=+****++++***********#############*********+++++++************+-::::::::::::::::.....................................................................................
// ..............................................................................::::::::-===========================+++++++++++++++++++++***********+::::::::::.................................................................:::..::::::::=+***+++++*********************###########******++****+++++*****=-:::::::::..:::.....................................................................................
// ..............................................................................::::::::::--========+========+++++++++++++++++++++++++++************+:.::::::::.................................................................:::..::::::::-=+++++++*********************************************+++++++++*++-:::::::::::::.....................................................................................
// .............................................................................::::::::::::::-----=====++++++++++++++++++++++++++++*****************+:.::::::::.................................................................:::::::::::::-=++++*************************************************++++++++++++=::::::::::::.....................................................................................
// .............................................................................:::::::::::::::::::---------=================++++********************+:::::::::::...............................................................::::::::::::::-=+++++*****************************************#***#*****++++++++++=::::::::::......................................................................................
// .............................................................................::::::::::::--::::--------------------====+++************************+:::::::::::...............................................................::::::::::::::-=+++********************************************************++++++++-:::.::::::.....................................................................................
// ..............................................................................:::::::.::::---------------------===++++***************************+-::::::::::.................................................................:::::::::::::=++++********************************************************++++++++=-:::::::::.....................................................................................
// ................................................................................:::::.:::::::-------------====++++*****+++++++++++++++++++======-::::::::::.:.................................................................::::::.:::::-=+++++*******************************************************+++++++++=:::::::::.....................................................................................
// .....................................................................................:::::::::::::---------============----------::::::::::::::::::::::::::::.................................................................:::::::::::-==++++++******************************************************++++++++*=:::::::::.....................................................................................
// ..............................................................................:::....:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::...............................................................::::::::::::-=++++++++++*************************************************++++++++++++-::::::::.....................................................................................
// ..............................................................................:::.......::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::................................................................:::::::::::-+++++++++++++++++++***********************************#****++++++++++**+=::::::::.....................................................................................
// ..............................................................................::::......:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::.................................................................::::::::::-=++++++++++++++++++++++++++++++++++***********###*******+++++++++++++++*+=-:::::::.....................................................................................
// .............................................................................:::::::.::.::::::::::::::::::::::::::::::::::::::::::.::::::::.::::::::::::::::::................................................................::::::::::-=++++++++++++++++++++++++++++++++++++++++++++****+++++++++++++++++++++**++-:::::::.....................................................................................
// ..............................................................................::::::.::...::::::::::::::::::::::::::::::::::::::::.:::::....::::::::::::::::::................................................................::::::::::-=+++++++++++++++++++++++++++++======+++++++++++++++++++++++++++++++++****+-:::::::.....................................................................................
// .................................................................................................................................................................................................................................:::::::-=++++++++++++++++++++++++++++===--====++++++++++++++++++++++++++++++*****+-:::.........................................................................................
// ..............................................................................................................................................................................................................................::::::.:::-=+++++++++++++++++++++++++++++==---===++++++++++++++++++++++++++********+-::::.:::.....................................................................................
// ..............................................................................................................................................................................................................................:::::::::::-=++++++++++++++++++++++++++++++====+++++++++++++++++++++++++**********+=::::..:::.....................................................................................
// ..............................................................................................................................................................................................................................:::::::::::--==++++++++++++++++++*******+++++++++++++++++++++++++++************++=-::::::::::.....................................................................................
// ..............................................................................................................................................................................................................................::::::::::::---==++++++++++++**********++++++++*****+++++++******************++===:::::::::::.....................................................................................
// .............................................................................................................................................................................................................................:::::::::::::-------===+++++++****************++*************************+++====++=:::::::::::.....................................................................................
// .............................................................................................................................................................................................................................::::::.::::::------===+++*********************************++++++++++++======+++++=-:::::::::::.....................................................................................
// ..............................................................................................................................................................................................................................:::..:::::::--==++++**************************************++++=========+++++++==-:::::............................................................................................
// ..............................................................................................................................................................................................................................:::..:::::::-==+++++********************************************+++++++++++===-:::::::............................................................................................
// ..............................................................................................................................................................................................................................::::::.:::::::--==++++**************************************************++=-::::::::::............................................................................................
// ..............................................................................................................................................................................................................................::::::.::::::::::::--===++++*****************************************++=--:::::...................................................................................................
// ..............................................................................................................................................................................................................................::::::::::::::::::::::::::::-----====++++++++++++++++++=====-------:::::::::::::..................................................................................................
// ..............................................................................................................................................................................................................................::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::..................................................................................................
// ..............................................................................................................................................................................................................................:::::::::::::::::::::::::::::::::::::::::::.....:::::::::::::::::::::::::.:::::...................................................................................................
// ................................................................................................................................................................................................................................................................................................................................................................................................................
// ................................................................................................................................................................................................................................................................................................................................................................................................................
// ................................................................................................................................................................................................................................................................................................................................................................................................................
// ................................................................................................................................................................................................................................................................................................................................................................................................................
// ................................................................................................................................................................................................................................................................................................................................................................................................................
// ................................................................................................................................................................................................................................................................................................................................................................................................................