const express=require("express"); // add express module
const app = express(); //express into object for furture usage
const path = require("path")

const PORT = 3000;

app.use(express.urlencoded({ extended: true }))

app.listen(PORT, (req, res) => {
    console.log("HTML server running");
});

app.get("/", (req, res,) => {
    res.sendFile(__dirname+'/index.html');
});

app.get("/greet", (req, res,) => {
    var name = "Guest"
    console.log(req.query);
    
    if (req.query.name){
        name = req.query.name
    }
    res.render('endpoint.ejs', {name: name});
});

