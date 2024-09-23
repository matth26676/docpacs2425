const express = require("express");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.get("/", (req, res) => {
	res.render("index.ejs");
});

app.get("/add", (req, res) => {
	res.render("add.ejs");
});

app.get("/view", (req, res) => {
	res.render("view.ejs");
});

app.post("/view", (req, res) => {
	console.log(req, res);
	res.send({message: "Data received"});
});

app.listen(port);