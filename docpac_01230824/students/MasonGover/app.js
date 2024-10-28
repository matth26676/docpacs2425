const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

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

		// Check form fields
		if (!body.name || !body.brand || !body.quantity) {
			throw new Error("Please fill all fields.");
		}
		if (body.quantity <= 0) {
			throw new Error("Quantity must be higher than 0.");
		}

		const data = JSON.parse(fs.readFileSync("./data.json")).data;
		data.push(body);
		fs.writeFileSync("./data.json", JSON.stringify({data}));
		res.redirect("/");
	} catch(err) {
		res.render("error.ejs", { error: err });
	}
});

app.get("/view", (req, res) => {
	const entry = req.query.entry;
	const jsonData = JSON.parse(fs.readFileSync("data.json")).data;
	if (!entry) {
		return res.render("view.ejs", { data: jsonData, isEntry: false });
	}

	const entryData = []
	for (const item of jsonData) {
		if (item.name == entry) {
			entryData.push(item);
		}
	}

	res.render("view.ejs", { data: entryData, isEntry: true });
});

app.listen(port);