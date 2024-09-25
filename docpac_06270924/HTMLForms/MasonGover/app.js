const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;
const expectedData = [
	"firstName",
	"lastName",
	"password",
	"confirmPassword",
	"favoriteColor",
	"leastFavoriteColor",
	"skibidiLevel",
	"sodaLikeness",
	"isSigma",
	"likesSoda"
]

function getData() {
	return JSON.parse(fs.readFileSync("data.json")) || {};
}

// Convert from a URL format to a JSON format
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("index.ejs");
});

app.get("/add", (req, res) => {
	res.render("add.ejs");
});

app.post("/add", (req, res) => {
	try {
		const body = req.body;
		const newData = { data: [] };
		for (const bodyData in body) {
			if (!expectedData.includes(bodyData)) {
				throw new Error(`Unexpected data: ${bodyData}`);
			}
		}

		for (const expectedData in expectedData) {
			if (!body[expectedData]) {
				throw new Error(`Missing data: ${expectedData}`);
			}
		}

		newData.data.push(body);
		fs.writeFileSync("./data.json", JSON.stringify(newData));
		res.redirect("/");
	} catch(err) {
		res.render("error.ejs", { error: err });
	}
});

app.get("/view", (req, res) => {
	const jsonData = getData();
	res.render("view.ejs", { data: jsonData.data[0] });
});

app.listen(port);