const express = require('express');
const ejs = require("ejs")
const app = express();
const fs = require('fs');
const path = require('path');
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index', { viewport: 'online' });
});

app.get('/print', (req, res) => {
    const ejs = require('ejs');
    const filePath = path.join(__dirname, 'views', 'index.ejs');
    const outputPath = path.join(__dirname, 'index.html');

    ejs.renderFile(filePath, { viewport: 'offline' }, (err, str) => {
        if (err) {
            return res.send('Error rendering file');
        }
        fs.writeFile(outputPath, str, (err) => {
            if (err) {
                return res.send('Error writing file');
            }
            res.send('File successfully written');
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);

});