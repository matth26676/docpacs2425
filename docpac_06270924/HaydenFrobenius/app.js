const express = require('express');
const path = require('path');

const app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the views directory
app.set('/', path.join(__dirname, '/'));

// Define a route
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});