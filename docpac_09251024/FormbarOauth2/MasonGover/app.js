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

app.get("/login", (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.username;

        db.get("SELECT * FROM users WHERE fb_id=?;", tokenData.id, (err, row) => {
            if (err) {
                console.error(err);
                res.send("An error occurred. Try again later.");
            } else if (!row) {
                db.run("INSERT INTO users (fb_name, fb_id, profile_checked) VALUES (?, ?, ?);", [tokenData.username, tokenData.id, 0], (err) => {
                    if (err) {
                        console.error("Database error: " + err);
                        res.send("An error occurred. Try again later.");
                    } else {
                        res.redirect("/profile");
                    }
                });
            } else {
                res.redirect("/profile");
            }
        });
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.get("/profile", isAuthenticated, (req, res) => {
    db.get("SELECT profile_checked FROM users WHERE fb_id=?;", req.session.token.id, (err, row) => {
        if (err) {
            console.error(err);
            res.send("An error occurred. Try again later.");
        } else {
            res.render("profile", { user: req.session.user, checked: row.profile_checked });
        }
    });
});

app.post("/profile", isAuthenticated, (req, res) => {
    if (req.session.user) {
        const profileChecked = req.body.profileChecked ? 1 : 0;
        db.run("UPDATE users SET profile_checked=? WHERE fb_id=?;", [profileChecked, req.session.token.id], (err) => {
            if (err) {
                console.error(err);
                res.send("An error occurred. Try again later.");
            } else {
                res.redirect("/profile");
            }
        });  
    } 
});

app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});
