const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('<h1>Hello</h1>');
});

app.get('/endpoint', (req, res) => {
    const name = req.query.name || 'Guest';
    res.render('Hello', { name });
});