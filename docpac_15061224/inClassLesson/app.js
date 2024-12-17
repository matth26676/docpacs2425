const express = require('express');
const port = 3000;
const app = express();
const ejs = require('ejs');
const fs = require('fs');

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

ejs.renderFile('./views/index.ejs', {viewport: false},(err, renderedTemplate) => {
    console.log(renderedTemplate);
    fs.writeFile('index.html', renderedTemplate, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('File created successfully');
        }
    });
});

app.listen(port, () => {    
    console.log('Server is running on port 3000');
});