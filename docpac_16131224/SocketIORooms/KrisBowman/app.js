//to install required modules, in terminal: "npm i express ejs sqlite3 crypto express-session socket.io"

const express = require("express"); //import express
const ejs = require("ejs"); //import ejs
const sqlite3 = require("sqlite3"); //import sqlite3
const crypto = require("crypto"); //import crypto
const session = require("express-session"); //import session
const http = require("http"); //import http
const socketIO = require("socket.io"); //import socket.io
const sharedsession = require("express-socket.io-session"); //import express-socket.io-session

const app = express(); //initialize express as the "app" object
const SERVER = http.createServer(app); //create HTTP server
const io = socketIO(SERVER); //attach socket.io to the server

const PORT = process.env.PORT || 3000; //set port number

app.set("view engine", "ejs"); //set view engine
app.use(express.urlencoded({ extended: true })); //encode url

//use the session middleware with Socket.io
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "secretString",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
});
app.use(sessionMiddleware);
io.use(sharedsession(sessionMiddleware, { autoSave: true }));


function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect("/")
};

function getUsersInRoom(room) {
    const clients = io.sockets.adapter.rooms.get(room) || new Set();
    const users = [];
    clients.forEach((clientId) => {
        const clientSocket = io.sockets.sockets.get(clientId);
        if (clientSocket && clientSocket.username) users.push(clientSocket.username);
    });
    return users;
};

const db = new sqlite3.Database("data/database.db", (err) => {
    if (err) {
        console.error("Error opening database: ", err.message);
        process.exit(1); // Exit process on critical error
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
    // Get session from socket request
    const session = socket.request.session;

    const defaultRoom = "general"; //default room name
    socket.room = defaultRoom; //set default room for new users
    socket.join(defaultRoom); //user automatically joins the default room

    var rooms = [defaultRoom]; //create rooms list

    console.log("A new user connected");

    //listen for client login
    socket.on("login", (username) => {
        if (!username) {
            console.log("Username is required.");
            return;
        };

        db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
            if (err) {
                console.error(err);
                socket.emit("chat message", "Database error.");
                return;
            };
            if (!user) {
                socket.emit("chat message", "User not found.");
                return
            };

            socket.username = username; //set the username in the client connection
            session.user = username; //store the username in session

            socket.join(defaultRoom); //user automatically joins the default room
            socket.emit("loginSuccess", { username }); //emit username tp client
            socket.emit("chat message", `You have joined the default room: ${defaultRoom}`);
            console.log(`${socket.username} has connected, and joined ${defaultRoom}`);
        });
    });

    socket.emit("rooms", rooms); //emit initial rooms list to client

    //listen for chat messages from client
    socket.on("chat message", (msg) => {
        if (/^\//.test(msg)) {
            handleCommand(socket, msg);
        } else {
            if (socket.room) {
                io.to(socket.room).emit("chat message", `${socket.username}: ${msg}`);
            } else {
                socket.emit("chat message", "Join a room to send messages.");
            };
        };
    });

    function handleCommand(socket, msg) {
        const [command, arg] = msg.slice(1).split(" ");
        switch (command) {
            case "join":
                if (arg) {
                    socket.join(arg);
                    socket.room = arg;
                    io.to(arg).emit("chat message", `${socket.username} joined room: ${arg}`);
                } else {
                    socket.emit("chat message", "Usage: /join [room]");
                };
                break;

            case "leave":
                if (arg) {
                    socket.leave(arg);
                    socket.emit("chat message", `You have left the room: ${arg}`);
                } else {
                    socket.emit("chat message", "Usage: /leave [room]");
                };
                break;

            case "users":
                const usersInRoom = getUsersInRoom(socket.room);
                socket.emit("chat message", `Users in room: ${usersInRoom.join(", ")}`);
                break;

            default:
                socket.emit("chat message", `Unknown command: /${command}`);
                break;
        };
    };

    //listen for client disconnect
    socket.on("disconnect", () => {
        console.log(`${socket.username} disconnected`);
        for (let room of socket.rooms) {
            if (room !== socket.id) {
                io.to(room).emit("chat message", `${socket.username} left the room.`);
            };
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
            db.get("SELECT * FROM users WHERE username=?;", [req.body.user], (err, row) => {
                if (err) {
                    console.error("Database error: ", err);
                    res.send("Something went wrong.");
                } else if (!row) {
                    //Create a new salt for this user
                    const salt = crypto.randomBytes(16).toString("hex");

                    //Use the salt to "hash" the password
                    crypto.pbkdf2(req.body.pass, salt, 1000, 64, "sha512", (err, derivedKey) => {
                        if (err) {
                            console.error("Error hashing password.");
                        } else {
                            const hashedPassword = derivedKey.toString("hex");

                            db.run("INSERT INTO users (username, password, salt) VALUES (?, ?, ?);", [req.body.user, hashedPassword, salt], (err) => {
                                if (err) {
                                    res.send("Database error.");
                                } else {
                                    req.session.user = req.body.user;
                                };
                            });
                        };
                    });
                } else if (row) {
                    //Compare stored password with provided password
                    crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, "sha512", (err, derivedKey) => {
                        if (err) {
                            console.error("Error hashing password.");
                        } else {
                            const hashedPassword = derivedKey.toString("hex");

                            if (row.password === hashedPassword) {
                                req.session.user = req.body.user;
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
        res.render("chatroom", { username: req.session.user });
    });
});