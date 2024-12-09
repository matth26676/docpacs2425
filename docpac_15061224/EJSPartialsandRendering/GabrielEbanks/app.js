const express = require('express');
const port = 3000;
const app = express();
const ejs = require('ejs');
const fs = require('fs');

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {viewport: 'online'});
});

app.get('/print', (req, res) => {
    console.log(viewport);  
    ejs.renderFile('./views/index.ejs', {viewport: 'offline'},(err, renderedTemplate) => {
        console.log(renderedTemplate);
        fs.writeFile('index.html', renderedTemplate, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Online File created successfully');
            }
        });
    });
    res.send('File created succesfully');
});


app.listen(port, () => {    
    console.log('Server is running on port 3000');
});