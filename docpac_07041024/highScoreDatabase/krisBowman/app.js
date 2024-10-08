//note to future me: 
//if using legacy code, make sure to install "node", "express", "ejs", and "sqlite3", using the command "npm install [module name]" in the terminal
//start the server using the command node app.js

/*---------
HTTP Server
---------*/ 


//add express module
const express=require("express"); 

//add sqlit3 module
const sqlite3=require("sqlite3")

//turn express into object for furture usage
const app = express();

//parse JSON data from POST
app.use(express.json());

//encode url
app.use(express.urlencoded({extended: true}));

//port number
const PORT = process.env.PORT ||4000;

//view engine
app.set("view engine", "ejs");

// Server Setup
app.listen(PORT,console.log(`Server started on port ${PORT}`));

/*----------
GET Requests
----------*/

//handle index
app.get("/", (req, res) => { 
    res.render("index"); 
}) 

//handle game
app.get("/game", (req, res) => { 
    res.render("game"); 
}) 

/*---------------
Game and Database
---------------*/

//connect to database
const db = new sqlite3.Database("./scores.db", (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
        throw err; //stop if database connection fails
    }
    console.log("Database connected.");
});

//handle POST request
app.post("/hiscores", (req, res) => {
    try { 
        //validate POST parameters
        const {name, score} = req.body;

        if (name && score) {
            console.log("Received data:", [name, score]);
        } else if (!name) { //if name is null
            throw new Error("Name not entered.");
        } else if (isNaN(score)) { //if score is not an integer
            throw new Error("Invalid score. Score must be a number.");
        };

        const ip = req.ip;
        console.log("Received data:", [ip, name, score]);

        //insert into database
        db.run("INSERT INTO scores (ip, name, score) VALUES (?, ?, ?)", [ip, name, score], function(err) {
            if (err) {
                console.log("Insertion error: ", err.message);
            } else {
                console.log("Insertion successful: ", this.lastID);
                res.redirect('/hiscores');
            };
        });
    
    //display error message page
    } catch (err) {
        res.render("error", {error: err.message});
    };
});  

//handle hiscores
app.get("/hiscores", (req, res) => {  

    //select from database
    db.all("SELECT * FROM scores ORDER BY score DESC", [], (err, rows) => {
        if (err) {
            throw new Error("Selection error: ", err.message);
        };
        
        // Get top 10
        const highScores = rows.slice(0, 10);
        res.render("hiscores", {scores: highScores});
    });
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