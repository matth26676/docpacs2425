const express = require("express");
const app = express();
const port = 3000;

// Use ejs
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    // Render a default "Hello, world" page.
    res.render("index.ejs");
});

app.get("/endpoint", (req, res) => {
    // If there's a name in the query, use that.
    // If there's not, default to "Guest" and render it.
    const name = req.query.name || "Guest";
    res.render("endpoint.ejs", { name });
});

app.listen(port);
