//to install required modules in the terminal: type "npm i express express-session ejs sqlite3 connect-sqlite3 socket.io path"

//import external modules
const express = require("express");
const session = require("express-session");
const ejs = require("ejs")
const SQLiteStore = require("connect-sqlite3")(session); //create the "SQLiteStore" object from session
const socketio = require("socket.io");
const path = require("path");

//import custom modules
const routes = require("./modules/routes.js")
const socket = require("./modules/socket.js")

/*-----------
server Config
-----------*/

const app = express(); //initialize express, set as the "app" object
const port = process.env.PORT || 3000; //set the port number

//initialize the server, set as the "server" object
const server = app.listen(port, () => {
    console.log("Server started on port", port)
});

const io = socketio(server); //create the "io" object from the server

//initiaize session, set as the "session_MIDDLEWARE" object
const session_MIDDLEWARE = session({
    store: new SQLiteStore,
    secret: process.env.session_SECRET || "fallback_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } //set to true if using HTTPS
});

app.set("view engine", "ejs"); //set ejs as the view engine
app.use(session_MIDDLEWARE); //configure the server to use middleware
app.use(express.urlencoded({ extended: true })); //encode url
app.use(express.static(path.join(__dirname, "views"))); //configure use the static "views" folder for requests

 //configure the server to use routes from routes.js
app.get("/", routes);
app.get("/login", routes);
app.get("/logout", routes);
app.get("/chat", routes);
app.post("/login", routes);

//configure the io object to use middleware
io.use((socket, next) => {
    session_MIDDLEWARE(socket.request, {}, next);
});

//configure the io object to use connect from socket.js
io.on("connection", socket);