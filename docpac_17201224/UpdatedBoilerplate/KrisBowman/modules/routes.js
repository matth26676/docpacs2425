const express = require("express");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3");
const crypto = require("crypto");
const router = express.Router();

//set URLs
const AUTH_URL = "https://formbar.yorktechapps.com/oauth";
const THIS_URL = "http://localhost:3000/login";

//create a new database, set as the "db" object
const db = new sqlite3.Database("data/database.db", (err) => {
    if (err) {
        console.error("Failed to connect to the database: ", err);
        process.exit(1); //exit the process
    };
});

/*----------
GET Requests
----------*/

//create root function
const index = (req, res) => {
    if (req.session.user) {
        //user is logged in
        res.render("index", { username: req.session.user });
    } else {
        //user is not logged in
        res.render("index", { username: null });
    };
};

//handle login
const loginGET = (req, res) => {
    res.render("login", { AUTH_URL: AUTH_URL, THIS_URL: THIS_URL });
};

//handle logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.send("Error destroying session: " + err);
        } else {
            res.redirect("/login");
        };
    });
};
//handle chat
const chat = (req, res) => {
    if (req.session.user) {
        //user is logged in
        res.render("chat", { username: req.session.user });
    } else {
        //user is not logged in
        res.render("chat", { username: null });
    };
};

/*-----------
POST Requests
-----------*/

const loginPOST = (req, res) => {
    //login with database
    if (req.body.user && req.body.pass) {
        db.get("SELECT * FROM users WHERE username=?;", req.body.user, (err, row) => {
            if (err) {
                console.log(err);
                res.send("There was an error:\n" + err);
            } else if (!row) {
                //create a new salt for this user
                const salt = crypto.randomBytes(16).toString("hex");

                //use the salt to "hash" the password
                crypto.pbkdf2(req.body.pass, salt, 1000, 64, "sha512", (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password: " + err);
                    } else {
                        const hashedPassword = derivedKey.toString("hex");

                        db.run("INSERT INTO users (username, password, salt) VALUES (?, ?, ?);", [req.body.user, hashedPassword, salt], (err) => {
                            if (err) {
                                res.send("Database error: \n" + err);
                            } else {
                                res.send("Created new user");
                            };
                        });
                    };
                });
            } else if (row) {
                //compare stored password with provided password
                crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, "sha512", (err, derivedKey) => {
                    if (err) {
                        res.send("Error hashing password: " + err);
                    } else {
                        const hashedPassword = derivedKey.toString("hex");

                        if (row.password === hashedPassword) {
                            req.session.user = req.body.user;
                            res.redirect("/");
                        } else {
                            res.send("Incorrect Password.")
                        };
                    };
                });
            };
        });
    } else if (req.query.token) {
        //login with formbar
        jwt.verify(req.query.token, "key_secret", (err, decoded) => {
            if (err) {
                console.log("JWT Error:", err);
                res.status(400).send("Invalid token.");
            } else {
                req.session.token = decoded;
                req.session.user = decoded.username;
                console.log("Session User:", req.session.user); //verify session user is set
                res.redirect("/");
            };
        });
    } else {
        res.send("Please enter both a username and password");
    };
};

module.exports = {
    index,
    loginGET,
    logout,
    chat,
    loginPOST
};