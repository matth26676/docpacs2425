// lets js know that it needs to use express and then grabs the express module
const { error } = require("console");
const { name } = require("ejs");
const express = require("express");
const fs = require("fs");
const { queryObjects } = require("v8");


const app = express();
const port = 3000;

app.use(express.urlencoded({extended: true}))

// uses the ejs templating engine to view files
app.set('view engine', 'ejs');

// sets the port used to port 3000
app.set('port', process.env.PORT || 3000);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', (req, res) => {
    console.log('test')
    
    try {
        if (!req.body.password) {
            throw new Error('no password')
        }
        var formdata = JSON.parse(fs.readFileSync(__dirname + '/data.json'))
        var formcolor = req.body.color
        var formpassword = req.body.password
        var object = {color:formcolor, password:formpassword}
        formdata.data.push(object)
        fs.writeFileSync(__dirname + "/data.json", JSON.stringify(formdata))
        res.redirect('/')
    } catch(err) {
        console.log(err)
        res.render('error', {err:err})
    }
});

app.get('/view', (req, res) => {
    var data = JSON.parse(fs.readFileSync(__dirname + '/data.json'))
    res.render('view', {data: data});
});

// logs each request
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// starts the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});