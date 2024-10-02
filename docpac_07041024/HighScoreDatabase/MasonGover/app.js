const express = require("express");
const sqlite = require("sqlite3").verbose();
const port = 3000;
const app = express();
const db = new sqlite.Database("database.db");

// Make sure the data comes in json
app.use(express.json());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/game", (req, res) => {
    res.render("game.ejs");
});

app.get("/hiscores", (req, res) => {
    try {
        db.all("SELECT * FROM scores", (err, rows) => {
            if (err) {
                throw new Error("An error occurred accessing the database.")
            }
    
            // Sort the scores & get the top 10 then display them
            rows.sort();
            rows.reverse();
            rows = rows.slice(0, 10);
            res.render("hiscores.ejs", { scores: rows });
        });
    } catch (err) {
        res.render("error.ejs", { error: err.message });
    }
});

app.post("/hiscores", (req, res) => {
    try {
        const body = req.body;
        if (body.score === null || body.name === null) {
            throw new Error("Score and name is required.")
        }

        const ip = req.ip;
        db.run("INSERT INTO scores (ip, name, score) VALUES (?, ?, ?)", [ip, body.name, body.score], (err) => {
            if (err) {
                throw new Error("An error occurred accessing the database.")
            }

            // The score was added successfully
            res.status(200).send();
        });
    } catch (err) {
        res.status(500).send();
    }
});

app.get("/error", (req, res) => {
    res.render("error.ejs")
});

app.listen(port);