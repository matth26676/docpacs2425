const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const ejs = require('ejs');

// Serve static files from the 'public' directory, but exclude index.html
app.use(express.static(path.join(__dirname, 'public'), {
    index: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    console.log('Rendering index.ejs with viewport: online');
    res.render('index', { viewport: 'online' });
});

app.get('/print', (req, res) => {
    console.log('Rendering index.ejs with viewport: offline');
    ejs.renderFile(path.join(__dirname, 'views', 'index.ejs'), { viewport: 'offline' }, (err, renderedTemplate) => {
        if (err) {
            console.error(err);
            res.send('Error rendering template');
            return;
        }
        fs.writeFile(path.join(__dirname, 'public', 'index.html'), renderedTemplate, (err) => {
            if (err) {
                console.error(err);
                res.send('Error writing file');
            } else {
                res.redirect('/endex'); // Redirect to /endex after successful file writing
            }
        });
    });
});

app.get('/endex', (req, res) => {
    console.log('Rendering print.ejs with viewport: offline');
    res.render('print', { viewport: 'offline' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});