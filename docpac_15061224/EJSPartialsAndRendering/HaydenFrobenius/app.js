const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('pages/index', {viewport: "online"});
});

app.get('/print', (req, res) => {
    app.render('pages/index', {viewport: "offline"}, (err, html) => {
        if (err) {
            console.error(err);
            return res.status(500).send('An error occurred');
        }

        // Save the rendered HTML to a file
        fs.writeFile('index.html', html, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('An error occurred');
            }

            return res.status(200).send('File Written');

        });

    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});