const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const port = 3000;

function getData() {
	return JSON.parse(fs.readFileSync("data.json")) || {};
}

app.use(bodyParser.json());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("index.ejs");
});

app.get("/add", (req, res) => {
	res.render("add.ejs");
});

app.post("/add", (req, res) => {
	try {
		console.log(req.body);
	} catch(err) {
		res.render("error.ejs", { error: err });
	}
});

app.get("/view", (req, res) => {
	const data = getData();
	res.render("view.ejs", { data });
});

app.listen(port);