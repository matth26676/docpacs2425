//to install required modules, in terminal: "npm i express ejs sqlite3 crypto jsonwebtoken express-session socket.io"

const express = require("express"); //import express
const ejs = require("ejs"); //import ejs
const sqlite3 = require("sqlite3"); //import sqlite3
const crypto = require("crypto"); //import crypto
const jwt = require("jsonwebtoken"); //import jsonwebtoken
const session = require("express-session"); //import session
const http = require("http"); //import http
const socketIO = require("socket.io"); //import socket.io

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
    console.log("A new user connected");

    //listen for client login
    socket.on("login", (username) => {
        db.get(`SELECT * FROM users WHERE username = ?`, username, (err, user) => {
            if (err) {
                console.error(err);
            } else {
                socket.userId = user.id;
                socket.username = user.username;
                socket.emit("loginSuccess", { user: user.username });
            }
        });
    });

    //listen for chat messages from client
    socket.on("chat message", (msg) => {
        console.log("Message: " + msg);
        io.emit("chat message", msg); //broadcast message to all clients
    });

    //listen for client disconnect
    socket.on("disconnect", () => {
        console.log(socket.username + " disconnected");
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