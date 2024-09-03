const express = require('express');
const app = express();

let ejs = require('ejs');

app.set('view engine', 'ejs');

app.listen(3000);

app.get('/', (req, res) => {
    res.render(__dirname+"/public/index.ejs");
});

app.get('/endpoint', (req, res) => {
    let name = "Guest";
    if(req.query.name){
        name = req.query.name;
    }

    res.render(__dirname+"/public/hello.ejs", {name: name});
});