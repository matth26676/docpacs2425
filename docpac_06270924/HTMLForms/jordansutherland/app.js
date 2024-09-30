const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    const user = { name: 'Jordan' };
    res.render('index', { user });
});

app.get('/add', (req, res) => {
    const user = { name: 'Jordan' };
    res.render('add', { user });
});

app.post('/add', (req, res) => {
    res.render('add', { user });
    console.log(req.body)
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});