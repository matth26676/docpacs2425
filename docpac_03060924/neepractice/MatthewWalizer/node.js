// lets js know that it needs to use express and then grabs the express module
const { name } = require("ejs");
const express = require("express");
const { queryObjects } = require("v8");


const app = express();
const port = 3000;

// uses the ejs templating engine to view files
app.set('view engine', 'ejs');

// sets the port used to port 3000
app.set('port', process.env.PORT || 3000);

// queries the name variable from the url, then checks to see if it is empty then changes it to Guest, else grabs the name and then sends it to the html web page before rendering it
app.get('/', (req, res) => {
    var name;
    if (req.query.name) {
        name = req.query.name
    } else {
        name = 'Guest'
    }
    res.render('index', {name: name});
});

// listen for vistis to the main page and responds with a message
app.post('/submit-form', (req, res) => {
    res.render();
});

// logs each request
app.use((req, res, next) => {
    console.log('${req.method} request for ${req.url}');
    next();
});

// starts the server
app.listen(port, () => {
    console.log('Server listening on port ${port}');
});