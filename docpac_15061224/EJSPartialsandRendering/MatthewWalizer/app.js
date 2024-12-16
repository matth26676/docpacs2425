const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {viewport: 'online'});
});

app.get('/print', (req, res) => {
    ejs.renderFile('views/index.ejs', {viewport: 'offline'}, (err, renderedTemplate) => {
        if (err) {
            console.log(err);
        } else {
            console.log(renderedTemplate);
            fs.writeFile('views/index.html', renderedTemplate, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('File written successfully');
                    res.send('File written successfully');
                }
            });
        }
    })
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});