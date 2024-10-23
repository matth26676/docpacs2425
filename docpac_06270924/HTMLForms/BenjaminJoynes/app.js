const { error } = require('console');
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { title: 'Home', message: 'Welcome!' });
});

app.get('/view', (req, res) => {
  try {
    const fileData = JSON.parse(fs.readFileSync('./data.json'));
    const games = fileData.data || []; 

    res.render('view', { title: 'View games', games : games }); 
  } catch (error) {
    res.render('error', { error: error.message });
  }
});


app.get('/add', (req, res) => {
  res.render('add', { title: 'Add', message: 'Add a Game' });
});

app.post('/add', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync('./data.json')).data;

    const gameData = {
      item: req.body.item,
      amount: req.body.amount
    };
    if (gameData.amount > 3) {
        throw new Error("Too many")
    } else if (!gameData.amount) {
        throw new Error("Number Required")
    } else if (gameData.item == '') {
        throw new Error("Game Required")
    }


    data.push(gameData);
    fs.writeFileSync('./data.json', JSON.stringify({data: data})); 

    res.redirect('/');
  } catch (error) {
    res.render('error', { error: error.message }); 
  }
});

app.listen(port, () => {
  console.log('Server Running At Port: 3000');
});