const express = require("express");
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('index');
});

app.get("/add", (req, res) => {
    res.render('add');
});

app.get("/view", (req, res) => {
    res.render('view');
});

app.listen(PORT, console.log(`Server is running on port ${PORT}`));
