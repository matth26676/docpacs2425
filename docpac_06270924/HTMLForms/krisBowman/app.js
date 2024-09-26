/*---------
HTTP Server
---------*/

const express=require("express"); // add express module
const fs = require("fs")

const app = express(); //express into object for furture usage
const PORT = process.env.PORT ||5000; //port number

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

// Handle GET request
app.get("/", (req, res) => { 
    res.render("index"); 
}) 

app.get("/add", (req, res) => { 
    res.render("add"); 
}) 

// Server Setup
app.listen(PORT,console.log(`Server started on port ${PORT}`));

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

        //convert back to string
        fs.writeFileSync("data.json", JSON.stringify(data));

        //push form data to array
        data.data.push({siteName, user, password});

        //redirect back to "/"
        res.render("index");

    } catch (err) {
        res.render("error", {error: err.message})
    };
    
});

//view passwords

app.get("/view", (req, res) => {
    const {siteName} = req.body;
    const data = JSON.parse(fs.readFileSync('data.json'));
    if ("/view".QueryString.Add({siteName})) {
        res.render('view', { entries: siteName });
    } else {
    res.render('view', { entries: data.data });
    };
});