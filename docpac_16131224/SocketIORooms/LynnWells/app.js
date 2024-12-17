/*___   _   _       _         ____             _        _     _       
 |_ _| | | | | __ _| |_ ___  / ___|  ___   ___| | _____| |_  (_) ___  
  | |  | |_| |/ _` | __/ _ \ \___ \ / _ \ / __| |/ / _ \ __| | |/ _ \ 
  | |  |  _  | (_| | ||  __/  ___) | (_) | (__|   <  __/ |_ _| | (_) |
 |___| |_| |_|\__,_|\__\___| |____/ \___/ \___|_|\_\___|\__(_)_|\__*/


//Declare all the CONSTANTS AND STUFF WHY IS THERE ALWAYS SO MUCH
const express = require('express');
const { WebSocketServer } = require('ws');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3');
const app = express();
const http = require('http');
const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const session = require('express-session');
const crypto = require('crypto');
const io = socketIo(server);
const db = new sqlite3.Database('data/database.db', (err) => { if (err) { console.log(err); } else { console.log('we good bruh'); } });//Hooray!

const rooms = {}; // Stores rooms
const usersInRooms = {}; // Stores users in rooms

//Sets the apps to use
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Sets the view engine to ejs
app.set('view engine', 'ejs');

function isAuthenticated(req, res, next) {
  if (req.session.user) next() //if there's a username in the token, go ahead
  else res.redirect('/login') //if not, go to login page
};

// Displays the index.ejs by default
app.get("/", (req, res) => {
  res.render("index");
});

// Displays the login page
app.get('/login', (req, res) => {
  res.render('login');
});

//Blah blah blah, handles login and stuff
app.post('/login', (req, res) => {
  if (req.body.user && req.body.pass) { //If there's a username and password
    db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
      if (err) {
        console.error(err);
        res.send("There wan an error:\n" + err)
      } else if (!row) {
        //create new salt for this user
        const salt = crypto.randomBytes(16).toString('hex')

        //use salt to "hash" password
        crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
          if (err) {
            res.setDefaultEncoding("Error hashing password: " + err)
          } else {
            const hashedPassword = derivedKey.toString('hex')
            db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPassword, salt], (err) => {
              if (err) {
                res.send("Database errpr:\n" + err)
              } else {
                res.send("Created new user") //Feel free to change this lol

              }
            })
          }
        })

      } else {
        //Compare stored password with provided password
        crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
          if (err) {
            res.send("Error hashing password: " + err)
          } else {
            const hashedPassword = derivedKey.toString('hex')

            if (row.password === hashedPassword) {
              req.session.user = req.body.user
              res.redirect("/chat")
            } else {
              res.send("Incorrect Password")
            }
          }
        })
      }

    })
  } else {
    res.send("You need a username and password");
  }
})

// Displays the chat page
app.get('/chat', isAuthenticated, (req, res) => {
  res.render('chat.ejs', { user: req.session.user })
})


//Listens for connections
io.on('connection', (socket) => {
  const userName = socket.handshake.query.userName;
  console.log('a user connected');

  // Join the "general" room by default
  const defaultRoom = 'general';

  rooms[defaultRoom] = [];
  usersInRooms[defaultRoom] = [];
  rooms[defaultRoom].push(socket.id); // Add user to the "general" room
  socket.join(defaultRoom);
  console.log('user joined room: ' + defaultRoom);
  socket.emit('message', `You joined room: ${defaultRoom}`);


  // Join a room
  socket.on('join room', (roomName) => {
    if (!rooms[socket.id]) {
      rooms[socket.id] = [];
    }
    socket.join(roomName);
    if (!usersInRooms[roomName]) {
      usersInRooms[roomName] = [];
    }
    usersInRooms[roomName].push(userName);
    rooms[socket.id].push(roomName);
    io.to(socket.id).emit('roomsList', rooms[socket.id]);
    console.log('user joined room: ' + roomName);
    socket.emit('message', `You joined room: ${roomName}`);
  });


  //Leave a room
  socket.on('leave room', (roomName) => {
    socket.leave(roomName);
    if (usersInRooms[roomName]) {
      usersInRooms[roomName] = usersInRooms[roomName].filter(user => user !== userName);
    }
    if (rooms[socket.id]) {
      rooms[socket.id] = rooms[socket.id].filter(room => room !== roomName);
    }
    io.to(socket.id).emit('roomsList', rooms[socket.id]);
    console.log('user left room: ' + roomName);
    socket.emit('message', `You left room: ${roomName}`);
  });

  //Handles getting users in rooms
  socket.on('get users', (roomName) => {
    const users = getUsersInRoom(roomName);
    socket.emit('users list', users);
  });

  function getUsersInRoom(roomName) {
    return usersInRooms[roomName] || [];
  }

  //Handles messages in rooms
  socket.on('chat message', (msg, roomName) => {
    const time = new Date().toLocaleTimeString();
    const messageData = {
      user: userName,
      message: msg,
      room: roomName,
      time: time
    };
    io.to(roomName).emit('chat message', messageData);
  });

  //Handles disconnects
  socket.on('disconnect', () => {
    console.log('user disconnected');
    // Remove user from rooms
    for (let roomName in usersInRooms) {
      usersInRooms[roomName] = usersInRooms[roomName].filter(user => user !== userName);
      if (usersInRooms[roomName].length === 0) {
        delete usersInRooms[roomName];
      }
    }
    delete rooms[socket.id];
  });
});








/* For those who need a refresher on THE ENEMY!! 👇

                                                                                                                             
                                                                                                             ▓ ▓             
                                                                                                            ██▓▓             
                                                                                               ░     ▒▓█▓▒▒██▓▒▒             
                                                                                             ▒▒░▓██████▓█▒█▓▓▒▒▒▒            
                                                                                        ░ ▒▒▒▓▓▒██████▓▓▓▓▓▓▓▓▒▒▒▒           
                                                                                         ▒░▓▓▓█████▓▓▓▓▓▓█▓▓▓████▓▒▒         
                                                                                         ▒▓████████▓▓▓▓▓▓█▓▓▒▓▓▒▓▒▒▒▒        
                                                                                        ▒▒████████▓▓▓▓▓▓▓███▓▓▓▓█▒▓▒▒▒▒      
                                                                                      ░ ▓▒████████▓▓▓▓▓▓███▓▓███▓▓▒▒▓▒▒▒     
                                                                                      ▒░███████████▓▓▓▓▓██████████▓▒▓▓▒█▓▒   
                                                                                  ░▒▒▓█████████▓█▓█▓▓▓▓▓███    █████▓▓▓███▒  
                                                                                   ░▒██████▓▓▓▓████▓▓▓▓▓██         ███▓██▓   
                                                 ▒▒▒▒▒▒▒▒░░▒▒▒▒▒                ▓▓▓▓▓█▓▓▓▓▓▓▓▓▓▓██▓▓▓▓▓▓██           ████    
                                             ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓██▓▓▓▓▓▒▒▓▓▓▓▓▓▓▓▓▓█▓                    
                                          ▒▒▒▒▒▒▒▒▓▒▒▒▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▒▓▓▓▓▓▓▓▓▓▓▓█                    
                                     ▒▓██▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓▒▒▓▒▓▓▓▓▓▓▓▓▓▓▓▓                     
                   ░               ░█████▒▒▒▒▒▓▒▓▓▓▓▓▓▓▓▓▒▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▒▒▒▓▓▓▓█▓▓▓▓▓▓                     
                  ▒▒░░            ▓▓████▓▓▒▒▒▓▓▓▓▓▓▓▓▓▓▒▒▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓▓▓█▓▓                      
        ░    ▒▒ ░░ ▓░▒░  ░       ▓███████▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▓▒▒▒▒▒▒▒▒▒▓▒▒▒▒▓▓▓▓█▓                       
        ░░▒▒ ░░▓░▒▒▓▓▓░ ░▒ ▒    ███████████▓▓▓▓▓▓▓▓▓██▓▓▓▓██▓▓▒▒▒▒▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▓▒▒▒▒▒▓▒▓▓▒▒▒▒▒▒▒▒▓▓▓█                      
       ░░ ▒▒▓▒▒▒▓▓▓▓▓▓▓▓▒▒▓▒▒▒▓▓██████████████▓▓▓▓▓▓▓▓▓▓██████▓▓▓▓▓▒▓▓▓▓▒▒▒▒▒▒▒▓▒▓▓▒▒▒▒▓▓▓▓▓▒▓▓▒▒▒▓▓▓██                      
      ░░▒░▒▓▓▓▓█▓▓▓▓█████████████████████ █████▓▓▓▓▓▓▓▓▓▒██▓█▓████▓▓▓▓▓▓▓▓▓▓▒▒▒▒▓█▓▓▒▒▒▓▓▓▓▓▓▒▓▒▒▒▓▓▓█                       
    ░░▒▒▓▒▒░▒▓▓█████████████████████████   ▓█████▓▓▓▓▓▓▓▒█████████████▓▓▓▓▓▓▓▓▓▓▓██▓▓▓▒▓▓█▓██▓▓▓▓▒▒▓▒                        
     ░▒▒░▒▓▓▓▓▓██████████████████▓█▓▓▓      ███████▓█▓▓▓▒▓██████████████████▓▓███████▓▓▓▓▓████▓█▓▒▓█                         
         ▒░▒▓█▓████████████████▓▓▓█          █████████▓▓▓▒█████   █████████████████████▓▓██████▓▓▓▓                          
       ░░ ▒▒▒▒▓▓▓█████████▒▓█▒▒▒ ░            ████████████████          ███████████████████████████                          
          ░ ▒▒▓▓▒▓▓▓▒▓▓▒░░ ░                  ███████████████                       ██████▓███████▓█                         
                                             ███████████████                         █████▓▓  ███▓▒██                        
                                          █████████████████                          ██████     █▓▓▓▓█                       
                                        ██████████ ███████                           ██████       █▓█▓█                      
                                        ███████   ███████                            ░████▓         ████                     
                                         █████    ███████                             ████▓          ███                     
                                          ████      █████                             ████▒          ███                     
                                           ████       █████                           ████          ██▒                      
                                            ████        █████                         ████        ███░                       
                                             ███▓         █████                      ████        ███▓                        
                                              ██▓▓          █████                  ████         ████                         
                                              ████▓          ██▓▓              ░█████       ▒▓▓▓██                           
                                               ███             ▓▓▓         ▒█▓█████         ▒▓██                             
                                             ▓▒▒▓             █▓█▓        ▓████             ░▓                               
                                             ▓▓▓                ▓▓        ██                                                 
                                              ▓                                                                              
                                                                                                                           */
