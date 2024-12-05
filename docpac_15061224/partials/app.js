const express = require('express');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index')
});

ejs.renderFile('./views/index.ejs', { viewport: 'string' },
    (err, renderedTemplate) => {
        console.log(renderedTemplate)
        fs.writeFile('index.html', renderedTemplate, (err) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log('File has been written successfully')
            }
        });
    });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

