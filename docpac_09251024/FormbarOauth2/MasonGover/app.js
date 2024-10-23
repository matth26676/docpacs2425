const sqlite3 = require("sqlite3");
const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const session = require("express-session");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const AUTH_URL = "http://172.16.3.212:420/oauth";
const THIS_URL = "http://localhost:3000/login";

app.use(session({
    secret: "projectsoda.com",
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect("/login")
};

const db = new sqlite3.Database("data/database.db", (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("we good bruh");
    }
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get('/login', (req, res) => {
    if (req.query.token) {
         let tokenData = jwt.decode(req.query.token);
         req.session.token = tokenData;
         req.session.user = tokenData.username;
         res.redirect('/');
    } else {
         res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.post("/login", (req, res) => {
    // if (req.body.user && req.body.pass) {
    //     db.get("SELECT * FROM users WHERE username=?;", req.body.user, (err, row) => {
    //         if (err) {
    //             console.error(err);
    //             res.send("There was an error:\n" + err);
    //         } else if (!row) {
    //             // Create a new salt for this user
    //             const salt = crypto.randomBytes(16).toString("hex");

    //             // Use this salt to "hash" the password
    //             crypto.pbkdf2(req.body.pass, salt, 1000, 64, "sha512", (err, derivedKey) => {
    //                 if (err) {
    //                     res.send("Error hashing password: " + err);
    //                 } else {
    //                     const hashedPassword = derivedKey.toString("hex");
    //                     db.run("INSERT INTO users (username, password, salt) VALUES (?, ?, ?);", [req.body.user, hashedPassword, salt], (err) => {
    //                         if (err) {
    //                             res.send("Database error:\n" + err);
    //                         } else {
    //                             res.send("Created new user");
    //                         }
    //                     });
    //                 }
    //             });

    //         } else {
    //             // Compare stored password with provided password
    //             crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, "sha512", (err, derivedKey) => {
    //                 if (err) {
    //                     res.send("Error hashing password: " + err);
    //                 } else {
    //                     const hashedPassword = derivedKey.toString("hex");
    //                     if (row.password === hashedPassword) {
    //                         req.session.user = row.username;
    //                         res.redirect("/profile");
    //                     } else {
    //                         res.send("Incorrect password");
    //                     }
    //                 }
    //             });
    //         }
    //     });
    // } else {
    //     res.send("You need a username and password");
    // }
});

app.get("/profile", isAuthenticated, (req, res) => {
    res.render("profile", { user: req.session.user });
});

app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});
