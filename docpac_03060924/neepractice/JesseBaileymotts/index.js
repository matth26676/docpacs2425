// Imports express from ExpressJS and assigns express() to app
import express from "express";
const app = express();
const port = 3000;

// Sets the template to EJS
app.set("view engine", "ejs");

// Renders an EJS HTML page that says "Hello, world!"
// Define routes
app.get("/", (req, res) => {
    res.render("index.ejs");
})

// Renders an EJS HTML page that says "Hello," and the name
// Input name by adding /endpoint?name= and then the name to add it
app.get("/endpoint", (req, res) => {
    const name = req.query.name || "guest";
    res.render("endpoint.ejs", { name });
})

// Listens to port 3000 for localhost
app.listen(port);