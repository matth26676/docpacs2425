const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fs = require('fs');


app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('pages/index', { viewport: "online" });
});

app.get('/print', (req, res) => {
    app.render('pages/index', { viewport: "offline" }, (err, html) => {
        if (err) {
            console.error(err);
            return err;
        }

        fs.writeFile('index.html', html, (err) => {
            if (err) {
                console.error(err);
                return err
            }

            return res.status(200).send('File Written');

        });

    });
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});