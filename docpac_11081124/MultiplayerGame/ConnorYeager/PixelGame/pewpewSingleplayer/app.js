const port = 3000;
const express = require('express');
const app = express()

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index')
});

app.get('/game', (req, res) => {
    res.render('game')
});

app.get('/lore', (req, res) => {
    res.render('lore')
});
app.get('/multiplayer', (req, res) => {
    res.render('multiplayer');
});

app.get('/game_hard', (req, res) => {
    res.render('game_hard')
});

app.listen(port, () => {
    console.log(`server started on http://localhost:${port}`)
})