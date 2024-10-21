const express = require("express");
const sqlite3 = require("sqlite3");
const crypto = require("crypto");

// Load database & create express serve
const db = new sqlite3.Database("database.db");
const app = express();
const secret = "rust>typescript!";
const port = 3000;

function encrypt(text) {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-128-cbc", secret, iv);
	const encryptedText = cipher.update(text, "utf8", "hex") + cipher.final("hex");
	return iv.toString("hex") + ":" + encryptedText; // Include iv to decrypt it later
}

function decrypt(encryptedText) {
	const parts = encryptedText.split(":");
	const iv = Buffer.from(parts[0], "hex");
	const encryptedPart = parts[1];
	const decipher = crypto.createDecipheriv("aes-128-cbc", secret, iv);
	const decrypted = decipher.update(encryptedPart, "hex", "utf8") + decipher.final("utf8");

    return decrypted;
}

// Use urlencoded middleware to passthrough form data
// & set view engine
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/home", (req, res) => {
	res.render("home", {query: req.query});
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/signup", (req, res) => {
	res.render("signup");
})

app.post("/login", async (req, res) => {
	try {
		// Get username and password & ensure they're not empty
		const { username, password } = req.body;
		if (!username || !password) {
			throw new Error("Missing fields.");
		}

		// Get user data from the database
		const getUserData = new Promise((resolve, reject) => {
			db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
				if (err) {
					reject(err);
				}
				if (!row) {
					reject("Invalid credentials.");
				}
	
				resolve(row);
			});
		});

		// Wait for the user data to be retrieved, decrypt the password, then check it
		const userData = await getUserData;
		const decryptedPassword = decrypt(userData.password);
		if (decryptedPassword !== password) {
			throw new Error("Invalid credentials.");
		}

		res.redirect(`/home?username=${username}&email=${userData.email}`);
	} catch (err) {
		res.redirect("/error");
	}
});

app.post("/signup", (req, res) => {
	try {
		// Get username, email, and password & ensure they're not empty
		const { username, email, password } = req.body;
		if (!username || !email || !password) {
			throw new Error("Missing fields.");
		}

		// Encrypt the password and place everything in the database
		const encryptedPassword = encrypt(password);
		db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, encryptedPassword], (err) => {
			if (err) {
				console.log(err);
				return res.redirect("/error"); // No try catch in callbacks
			}
			res.redirect("/login");
		});
	} catch (err) {
		res.redirect("/error");
	}
});

app.get("/error", (req, res) => {
	res.render("error");
});

app.listen(port);