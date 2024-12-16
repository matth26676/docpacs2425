const express = require('express');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
const port = 3000;

const viewpoint = 'online';

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    const styleVar = viewpoint === 'online' ? '1' : '2';
    res.render('index', { viewpoint: viewpoint, styleVar: styleVar });
});

app.get('/print', (req, res) => {
    const styleVar = '2'; // Always '2' for offline
    ejs.renderFile('./views/index.ejs', { viewpoint: 'offline', styleVar: styleVar }, (err, rendertemplate) => {
        if (err) {
            console.log(err);
            res.status(500).send('Error rendering template');
            return;
        }
        fs.writeFile('./views/index.html', rendertemplate, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error writing file');
                return;
            }
            res.send('Printed version created successfully');
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});