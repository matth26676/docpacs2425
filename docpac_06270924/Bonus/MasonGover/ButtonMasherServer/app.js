const express = require("express");
const fs = require("fs");
const port = 3000;
const app = express();

// Make sure the data comes in json
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile("./public/index.html", { root: __dirname });
});

app.post("/score", (req, res) => {
    try {
        const body = req.body;
        if (body.score === undefined) {
            return res.status(400).send("Score is required");
        }

        const scoreData = JSON.parse(fs.readFileSync("./scores.json"));
        scoreData[req.ip] = body.score;
        fs.writeFileSync("./scores.json", JSON.stringify(scoreData));
    } catch (err) {
        res.status(500).send("An error occurred");
    }
});

app.listen(port);