const express = require("express");
const ejs = require("ejs")
const fs = require("fs")

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index", { viewport: "online" });
});

app.get('/print', (req, res) => {
    ejs.renderFile("./views/index.ejs", { viewport: "offline" }, (err, renderedTemplate) => {
        if (err) {
            console.error("Error generating HTML file", err);
            return;
        };
        fs.writeFile("index.html", renderedTemplate, (err) => {
            if (err) {
                console.error("Error writing file", err);
                return;
            } else {
                res.send("File written successfully.");
            };
        });
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});