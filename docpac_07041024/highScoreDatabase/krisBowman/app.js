/*---------
HTTP Server
---------*/ 

//add express module
const express=require("express"); 

//give access to filesystem
const fs = require("fs");

//express into object for furture usage
const app = express();

//port number
const PORT = process.env.PORT ||5000;

//view engine
app.set("view engine", "ejs");

//encode url
app.use(express.urlencoded({extended: true}));

// Server Setup
app.listen(PORT,console.log(`Server started on port ${PORT}`));

/*----------
GET Requests
----------*/

//handle index
app.get("/", (req, res) => { 
    res.render("index"); 
}) 

//handle add
app.get("/add", (req, res) => { 
    res.render("add"); 
}) 

/*---------------
Game and Database
---------------*/
