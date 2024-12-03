const express = require('express');
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
    res.send('test')
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});