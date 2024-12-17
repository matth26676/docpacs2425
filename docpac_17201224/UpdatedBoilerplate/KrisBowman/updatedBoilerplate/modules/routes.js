const express = require("express");
const sqlite3 = require("sqlite3");
const crypto = require("crypto");
const router = express.Router();

//create a new database, set as the "db" object
const db = new sqlite3.Database("data/database.db", (err) => {
    if (err) {
        console.error("Failed to connect to the database: ", err);
        process.exit(1); //exit the process
    };
});

//create isAuthenticated function
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) next();
    else res.redirect("/login");
};

/*----------
GET Requests
----------*/

//create root function
router.get("/", (req, res) => {
    if (req.session.user) {
        //user is logged in
        res.render("index", { username: req.session.user });
    } else {
        //user is not logged in
        res.render("index", { username: null });
    };
});

//handle login
router.get("/login", (req, res) => {
    res.render("login");
});

//handle logout
router.get("/logout", isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.send("Error destroying session: " + err);
        } else {
            res.redirect("/login");
        };
    });
});

//handle chat
router.get("/chat", isAuthenticated, (req, res) => {
    if (req.session.user) {
        //user is logged in
        res.render("chat", { username: req.session.user });
    } else {
        //user is not logged in
        res.render("chat", { username: null });
    };
});

/*-----------
POST Requests
-----------*/

router.post("/login", (req, res) => {
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
    } else {
        res.send("Please enter both a username and password");
    };
});

module.exports = router;