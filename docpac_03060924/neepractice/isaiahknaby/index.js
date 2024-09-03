const express = require("express");
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('index.ejs');
});

app.get("/endpoint", (req, res) => {
    const name = req.query.name || "Guest";
    res.render('endpoint.ejs', { name });
});

app.listen(PORT);
