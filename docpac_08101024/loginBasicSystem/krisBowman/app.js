//note to future me: 
//if using legacy code, make sure to install "node", "express", "ejs", "sqlite3", and "crypto", using the command "npm install [module name]" in the terminal
//start the server using the command node app.js

/*---------
HTTP Server
---------*/


//add express module
const express = require("express");

//add sqlit3 module
const sqlite3 = require("sqlite3")

//add crypto module
const crypto = require('crypto');

//turn express into object for furture usage
const app = express();

//parse JSON data from POST
app.use(express.json());

//encode url
app.use(express.urlencoded({ extended: true }));

//port number
const PORT = process.env.PORT || 3000;

//view engine
app.set("view engine", "ejs");

// Server Setup
app.listen(PORT, console.log(`Server started on port ${PORT}`));

/*--------
Encryption
--------*/

//symmetric encryption function
const symEncrypt = (key, plaintext) => {
    // create random initialization vector
    const iv = crypto.randomBytes(12).toString("base64"); //convert to base64 before encryption

    // create cipher object
    const CIPHER = crypto.createCipheriv("aes-256-gcm", // use encryption algorithm
        Buffer.from(key, "base64"),
        Buffer.from(iv, "base64"));

    // update cipher with the plaintext to encrypt
    let ciphertext = CIPHER.update(plaintext, "utf8", "base64");
    ciphertext += CIPHER.final('base64');

    // retrieve the authentication tag
    const tag = CIPHER.getAuthTag()

    return { ciphertext, iv: iv.toString("base64"), tag: tag.toString("base64"), }
};

/*--------
Decryption
--------*/

//symmetric decryption function
const symDecrypt = (key, iv, ciphertext, tag) => {
    // create decipher object
    const DECIPHER = crypto.createDecipheriv("aes-256-gcm",
        Buffer.from(key, "base64"),
        Buffer.from(iv, "base64"));

    // set the authentication tag
    DECIPHER.setAuthTag(Buffer.from(tag, "base64"));

    // decrypt the ciphertext
    let decrypted = DECIPHER.update(ciphertext, "base64", "utf8");
    decrypted += DECIPHER.final("utf8");

    return decrypted;
};

/*----------
GET Requests
----------*/

//handle index
app.get("/", (req, res) => {
    res.render("index");
})

//handle login
app.get("/login", (req, res) => {
    res.render("login");
})

//handle signUp
app.get("/signUp", (req, res) => {
    res.render("signUp");
})

//handle error
app.get("/error", (req, res) => {
    res.render("error");
})

//handle home
app.get("/home", (req, res) => {
    // Fetch users from the database
    db.all("SELECT username, email FROM users", [], (err, users) => {
        if (err) {
            res.render("error", { error: "Error retrieving users." });
            return;
        }
        res.render("home", { users }); // Pass users to the view
    });
});

/*------
Database
------*/

//connect to database
const db = new sqlite3.Database("./users.db", (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
        throw err; //stop if database connection fails
    }
    console.log("Database connected.");
});

//handle POST request
app.post("/login", (req, res) => {
    try {
        //validate POST parameters
        const {user, pass} = req.body;

        if (user && pass) {
            console.log("Received data.");
        } else if (!user) { //if user is null
            throw new Error("Username is required.");
        } else if (!pass) { //if pass is null
            throw new Error("Password is required.");
        };

        //find login in database
        db.get("SELECT * FROM users WHERE username = ?", [user], function (err, row) {
            if (err) {
                res.render("error", {error: "Error retrieving user."});
                return;
            }

            if (!row) {
                res.render("error", {error: "Invalid username or password."});
                return;
            } 
            
            //decrypt password from database
            const DECIPHER = symDecrypt(row.key, row.iv, row.password, row.tag);
            const dcBuffer = Buffer.from(DECIPHER, "utf8"); // Ensure correct encoding
            const userBuffer = Buffer.from(pass, "utf8"); // Ensure correct encoding

            // Compare decrypted password with the provided password
            if ((dcBuffer.length !== userBuffer.length)) {
                console.error("Password lengths do not match.");
                res.render("error", {error: "Invalid username or password."});
                return;
            }

            const match = crypto.timingSafeEqual(Buffer.from(DECIPHER), Buffer.from(pass));

            if (match) {
                console.log("Login successful: ", this.lastID);
                res.redirect(`/home?user=<username>&email=<email>`);
            } else {
                console.error("Password lengths do not match.");
                res.render("error", {error: "Invalid username or password."});
                return;
            }

        });
    //display error message page
    } catch (err) {
        res.render("error", { error: err.message });
    };
});

app.post("/signUp", (req, res) => {
    try {
        //validate POST parameters
        const {user, email, pass} = req.body;
        
        if (user && email && pass) {
            console.log("Received data.");
        } else if (!user) { //if user is null
            throw new Error("Username is required.");
        } else if (!email) { //if email is null
            throw new Error("Email address is required.");
        } else if (!pass) { //if pass is null
            throw new Error("Password is required.");
        };
        
        db.get("SELECT * FROM users WHERE username = ? OR email = ?", [user, email], function (err, row) {
            if (err) {
                res.render("error", {error: "Error checking for existing users."});
                return;
            };
            if (row) {
                res.render("error", {error: "Username or email is already in use." });
                return;
            };
        });
        

        //turn passwords into plaintext
        const plaintext = pass;
        //encrypt password
        const key = crypto.randomBytes(32).toString("base64"); //generate key (and convert key to base64)
        const {ciphertext, iv, tag} = symEncrypt(key, plaintext);

        //insert into database
        if (user, email, ciphertext, iv, key, tag) {
            db.run("INSERT INTO users (username, email, password, iv, key, tag) VALUES (?, ?, ?, ?, ?, ?)", [user, email, ciphertext, iv, key, tag], function (err) {
                if (err) {
                    res.render("error", {error: "Insertion error."});
                } else {
                    console.log("Insertion successful: ", this.lastID);
                    res.redirect("/login");
                };
            });
        } else {
            throw new Error("All fields are required.");
        };
    } catch (err) {
        res.render("error", { error: err.message });
    };
});

//close database connection
process.on("SIGINT", () => {
    db.close((err) => {
        if (err) {
            console.error("Error closing connection: ", err.message);
        }
        console.log("Connection closed.");
        process.exit(0);
    });
});