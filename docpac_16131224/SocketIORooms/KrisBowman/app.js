//to install required modules, in terminal: "npm i express ejs sqlite3 crypto express-session socket.io"

const express = require("express"); //import express
const ejs = require("ejs"); //import ejs
const sqlite3 = require("sqlite3"); //import sqlite3
const crypto = require("crypto"); //import crypto
const session = require("express-session"); //import session
const http = require("http"); //import http
const socketIO = require("socket.io"); //import socket.io
const { ADDRGETNETWORKPARAMS } = require("dns");

const app = express(); //initialize express as the "app" object
const SERVER = http.createServer(app); //create HTTP server
const io = socketIO(SERVER); //attach socket.io to the server

const PORT = process.env.PORT || 3000; //set port number

app.set("view engine", "ejs"); //set view engine
app.use(express.urlencoded({ extended: true })); //encode url

app.use(session({
    secret: process.env.SESSION_SECRET || "secretString",
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect("/")
};

const db = new sqlite3.Database("data/database.db", (err) => {
    if (err) {
        console.log(err);
    } else {
        SERVER.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    };
});

/*--------------
Socket.io Config
--------------*/

//handle Socket.io Connection
io.on("connection", (socket) => {
    const defaultRoom = "general";
    var rooms = [defaultRoom]; //create rooms list

    console.log("A new user connected");

    //listen for client login
    socket.on("login", (username) => {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
            if (err) {
                console.error(err);
                socket.emit("chat message", "Database error.");
            } else if (!user) {
                socket.emit("chat message", "User not found.");
            } else {
                socket.username = user.username;
                socket.join(defaultRoom); //ensure the user joins the default room
                
                socket.emit("loginSuccess", {
                    username: socket.username
                });

                socket.emit("chat message", `You have joined the default room: ${defaultRoom}`);
                console.log(`${socket.username} has connected, and joined ${defaultRoom}`);
            };
        });
    });

    socket.emit("rooms", rooms); //emit initial rooms list to client

    //listen for chat messages from client
    socket.on("chat message", (msg) => {
        if (/^\//.test(msg)) {
            [command, arg] = msg.slice(1).split(" "); //remove "/" and split by space

            switch (command) {
                case "join":
                    if (arg) {
                        socket.join(arg); //join the given room
                        socket.room = arg; //save room on the client
                        io.emit("chat message", `Joined room: ${arg}`); //send confirmation message
                    } else {
                        socket.emit("chat message", "Command usage: /join [room]") //send command structure
                    };
                    break;
                case "leave":
                    if (socket.room) {
                        if (arg) {
                            socket.leave(arg) //leave the given room
                            socket.to(socket.room).emit("chat message", `${socket.username} left the room.`);
                        } else {
                            socket.emit("chat message", "Command usage: /leave [room]") //send command structure
                        };
                    };
                    break;
                case "users":
                    if (socket.room) {
                        const usersInRoom = getUsersInRoom(socket.room); // Implement this function to get users in the room
                        socket.emit("chat message", `Users in ${socket.room}: ${usersInRoom.join(", ")}`);
                    } else {
                        socket.emit("chat message", "You are not in a room.");
                    };
                    break;

                default:
                    socket.emit("chat message", "Unknown command.");
            };
        } else {
            //broadcast message to users in the same room (if in a room)
            if (socket.room) {
                io.to(socket.room).emit("chat message", msg);
            } else {
                //notify user to join a room
                socket.emit("chat message", "Join a room to send messages.");
            };
        };
    });

    //listen for client disconnect
    socket.on("disconnect", () => {
        console.log(socket.username + " disconnected");
    });

    function getUsersInRoom(room) {
        const clients = io.sockets.adapter.rooms.get(room) || new Set();
        const users = [];
        clients.forEach((clientId) => {
            const clientSocket = io.sockets.sockets.get(clientId);
            if (clientSocket && clientSocket.username) users.push(clientSocket.username);
        });
        return users;
    };
});

/*------------
Route Requests
------------*/

//handle login (GET)
app.get("/", (req, res) => {
    res.render("login");
});

//handle login (POST)
app.post("/", (req, res) => {
    if (req.body.user && req.body.pass) {
        db.get("SELECT * FROM users WHERE username=?;", req.body.user, (err, row) => {
            if (err) {
                console.log("Database error: ", err);
                res.send("Something went wrong.");
            } else if (!row) {
                //Create a new salt for this user
                const salt = crypto.randomBytes(16).toString("hex");

                //Use the salt to "hash" the password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, "sha512", (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password.");
                    } else {
                        const hashedPassword = derivedKey.toString("hex");

                        db.run("INSERT INTO users (username, password, salt) VALUES (?, ?, ?);", [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send("Database error.");
                            } else {
                                res.send("Created a new user.");
                            };
                        });
                    };
                });
            } else if (row) {
                //Compare stored password with provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, "sha512", (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password.");
                    } else {
                        const hashedPassword = derivedKey.toString("hex");

                        if (row.password === hashedPassword) {
                            req.session.user = req.body.user;
                            res.redirect("/chatroom");
                        } else {
                            res.send("Incorrect Password.")
                        };
                    };
                });
            };
        });
    } else {
        res.send("Please enter a username and password");
    };
});

///handle chatroom (GET)
app.get("/chatroom", isAuthenticated, (req, res) => {
    res.render("chatroom")
});