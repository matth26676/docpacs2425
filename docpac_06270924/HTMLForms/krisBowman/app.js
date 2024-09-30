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

/*--------------
Password Manager
--------------*/

//handle POST request
app.post("/add", (req, res) => {
    try { 
        //validate POST parameters
        const {siteName, user, password} = req.body;
        
        if (!siteName){
            throw new Error("Website or account name required.");
        }
        if (!user) {
            throw new Error("Username required.");
        }
        if (!password){
            throw new Error("Password required.");
        }

        //read data.json and save content to js object
        const data = JSON.parse(fs.readFileSync("data.json"));

        //push form data to array
        data.data.push({siteName, user, password});

        //convert back to string
        fs.writeFileSync("data.json", JSON.stringify(data));

        //redirect back to "/"
        res.redirect("/");
    } catch (err) {
        res.render("error", {error: err.message});
    };  
});

//view passwords

app.get("/view", async (req, res) => {
    try {
        //read data.json and save content to js object
        const data = JSON.parse(fs.readFileSync("data.json"));

        //render view for specific entry
        const {siteName} = req.query;
        if (siteName) {
            const entry = data.data.find(item => item.siteName === siteName);
            if (entry) {
                res.render("entry", {entry});
            } else {
                res.render("error", {error: "Entry not found."});
            };
        } else {
        //siteName not provided
        res.render("view", {entries: data.data});
        };

    } catch (err) {
        res.render("error", {error: "Failed to load data."});
    };
});