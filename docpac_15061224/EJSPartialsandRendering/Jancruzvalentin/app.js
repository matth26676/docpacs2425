const express = require('express');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
const port = 3000;


app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('index', { viewport: 'online' });
});

app.get('/print', (req, res) => {
    ejs.renderFile('./views/index.ejs', { viewport: 'offline' }, (err, rendertemplate) => {
        if (err) {
            console.log(err);
        }
        fs.writeFile('./views/index.html', rendertemplate, (err) => {
            if (err) {
                console.log(err);
            }
            res.send('Printed successfully')
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});