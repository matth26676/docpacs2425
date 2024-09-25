const express = require('express');
const app = express();
const PORT = 3000;


//View engine to ejs
app.set('view engine', 'ejs');
app.set('/', __dirname + '/');

//Get endpoint to the 'index' html file
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/add', (req, res) => {
    res.render('add');
});

//Lisen to the skibidi port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});