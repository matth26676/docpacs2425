//to install required modules, in terminal: "npm i express ejs sqlite3 crypto express-session socket.io"

const express = require("express"); //import express
const ejs = require("ejs"); //import ejs
const sqlite3 = require("sqlite3"); //import sqlite3
const crypto = require("crypto"); //import crypto
const session = require("express-session"); //import session
const http = require("http"); //import http
const socketIO = require("socket.io"); //import socket.io

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
    saveUninitialized: false
});

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

app.use(sessionMiddleware);
io.use(wrap(sessionMiddleware));

function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        console.log("unauthorized.")
        res.redirect("/"); // redirect to login if not authenticated
    };
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

function errorHandle() {
    console.error(err);
    return res.send("login", { error: "Something went wrong." }); //display the error to the user
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

    //listen for client login
    socket.on("login", (data) => {
        console.log(data.username);

        if (!data.username) {
            console.log("Username is required.");
            return;
        };

        db.get(`SELECT * FROM users WHERE username=?`, [data.username], (err, user) => {
            if (err) {
                console.error(err);
                socket.emit("chat message", "Database error.");
                return;
            };
            if (!user) {
                socket.emit("chat message", "User not found.");
                return
            };
            socket.request.session.user = data.username;  //update session with the username
            socket.request.session.save(() => {
                console.log(`Session saved for ${data.username}`);
            });

            socket.emit("loginSuccess", { username: data.username }); //emit username to client
            console.log(`New user assigned to username: "${data.username}"`)
        });
    });

    const rooms = new Set(["general"]); // Use a Set to avoid duplicates

    socket.on("join", (room) => {
        if (!room) return socket.emit("chat message", "Room name required.");
        rooms.add(room);
        socket.leave(socket.room);
        socket.join(room);
        socket.room = room;
        io.to(room).emit("chat message", `${socket.username} joined room: ${room}`);
        socket.emit("rooms", Array.from(rooms)); // Send updated room list
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

    //listen for client disconnect
    socket.on("disconnect", () => {
        if (!socket.username) return;
        console.log(`${socket.username} disconnected`);
        for (let room of socket.rooms) {
            if (room !== socket.id) {
                io.to(room).emit("chat message", `${socket.username} left the room.`);
            };
        };
    });
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
                errorHandle();
            } else if (!row) {

                //create a new salt for this user
                const salt = crypto.randomBytes(16).toString("hex");

                //hash the password using the salt
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, "sha512", (err, derivedKey) => {
                    const hashedPassword = derivedKey.toString("hex");

                    db.run("INSERT INTO users (username, password, salt) VALUES (?, ?, ?);", [req.body.user, hashedPassword, salt], (err) => {
                        if (err) {
                            errorHandle();
                        } else {
                            req.session.user = req.body.user;
                            return res.redirect("/chatroom"); //server-side redirect to chatroom
                        }
                    });
                });
            } else {

                //compare stored password with provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, "sha512", (err, derivedKey) => {
                    if (err) {
                        errorHandle();
                    }

                    const hashedPassword = derivedKey.toString("hex");

                    if (row.password === hashedPassword) {
                        req.session.user = req.body.user;
                        return res.redirect("/chatroom");
                    } else {
                        return res.render("login", { error: "Incorrect username or password." });
                    }
                });
            }
        });
    } else {
        return res.send("Please enter a username and password");
    }
});

///handle chatroom (GET)
app.get("/chatroom", isAuthenticated, (req, res) => {
    res.render("chatroom", { username: req.session.user });
});