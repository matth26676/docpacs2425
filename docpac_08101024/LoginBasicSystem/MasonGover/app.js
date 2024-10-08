const express = require("express");
const sqlite3 = require("sqlite3");
const crypto = require("crypto");

// Load database & create express serve
const db = new sqlite3.Database("database.db");
const app = express();
const secret = "nomnomnom";
const port = 3000;

// Use urlencoded middleware to passthrough form data
// & set view engine
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/home", (req, res) => {
	res.render("home");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/signup", (req, res) => {
	res.render("signup");
})

app.post("/login", (req, res) => {
	try {
		// Get username and password & ensure they're not empty
		const { username, password } = req.body;
		if (!username || !password) {
			throw new Error("Missing fields.");
		}

		const key = crypto.createCipher("aes-128-cbc", secret);
		const hashedPassword = key.update(password, "utf8", "hex") + key.final("hex");
		console.log(`Hashed password: ${hashedPassword}`);
	} catch (err) {
		console.log(err);
	}
});

app.post("/signup", (req, res) => {
	try {
		// Get username, email, and password & ensure they're not empty
		const { username, email, password } = req.body;
		if (!username || !email || !password) {
			throw new Error("Missing fields.");
		}

		const key = crypto.createCipher("aes-128-cbc", secret);
		const hashedPassword = key.update(password, "utf8", "hex") + key.final("hex");
		console.log(`Hashed password: ${hashedPassword}`);
		db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword], (err) => {
			console.log(err);
		});
	} catch (err) {
		console.log(err);
	}
});

app.listen(port);