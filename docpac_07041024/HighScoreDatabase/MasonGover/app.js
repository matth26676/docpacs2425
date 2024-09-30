const express = require("express");
const sqlite = require("sqlite3");
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
    res.render("/game.ejs");
});

app.get("/hiscores", (req, res) => {
    // todo
});

app.post("/hiscores", (req, res) => {
    try {
        // Old code
        // const body = req.body;
        // if (body.score === undefined) {
        //     return res.status(400).send("Score is required");
        // }

        // const scoreData = JSON.parse(fs.readFileSync("./scores.json"));
        // scoreData[req.ip] = body.score;
        // fs.writeFileSync("./scores.json", JSON.stringify(scoreData));
    } catch (err) {
        res.status(500).send("An error occurred");
    }
});

app.listen(port);