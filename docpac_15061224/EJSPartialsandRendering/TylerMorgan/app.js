const express = require('express');
const ejs = require('ejs');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

var viewport = "online";

app.get('/', (req, res) => {
    res.render('index', { viewport: viewport });
});
app.get('/print', (req, res) => {
    viewport = "offline";
    ejs.renderFile('./views/index.ejs', { viewport: viewport },
        (err, renderedTemplate) => {
            console.log(renderedTemplate);

            fs.writeFile('index.html', renderedTemplate, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log("everythings good");

                }
            });
        });
    res.send("You are at print")
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});