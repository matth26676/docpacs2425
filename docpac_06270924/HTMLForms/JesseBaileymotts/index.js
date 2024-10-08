// Imports express from ExpressJS and assigns express() to app
// Assigns PORT to 3000
const express = require('express');
const app = express();
const PORT = 3000;
const fs = require('fs');

// Sets the engine to EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

// Gets the Index EJS page
app.get('/', (req, res) => {
    res.render("index");
});

app.get('/add', (req, res) => {
    res.render("add")
});

app.post('/add', (req, res) => {
    try {
        let quoteData = {
            quote: req.body.quote,
            name: req.body.name,
        };
        if (!quoteData.quote) {
            throw new Error('Quote Required');
        }
        if (!quoteData.name) {
            throw new Error('Name Undefined');
        }
        let data = JSON.parse(fs.readFileSync('./data.json')).data;
        data.push(quoteData);
        fs.writeFileSync('./data.json', JSON.stringify({data: data}));
        res.redirect('/');
    } catch (err) {
        res.render('error', {error: err.message});
    };
});

app.get('/view', (req, res) => {
    let data = JSON.parse(fs.readFileSync('./data.json')).data;
    res.render('view', {data: data});
} );

// Listens to the port and logs when it is running
app.listen(PORT, console.log('Server is running on port', PORT))