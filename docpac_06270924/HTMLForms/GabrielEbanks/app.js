const express = require('express');
const fs = require('fs');
const app = express();
const port = 5500;

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { title: 'Home', message: 'Welcome!' });
});

app.get('/add', (req, res) => {
  res.render('add', { title: 'Add', message: 'Add an item!' });
});

app.post('/add', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync('./data.json'));

    const orderData = {
      item: req.body.item,
      amount: req.body.amount
    };

    if (orderData.item === '') throw new Error("Item Required");
    if (orderData.amount > 20) throw new Error("Too Much");
    if (!orderData.amount) throw new Error("Quantity Required");

    data.push(orderData);
    fs.writeFileSync('./data.json', JSON.stringify(data)); // Corrected structure

    res.redirect('/');
  } catch (error) {
    res.render('error', { error: error.message }); // Corrected error handling
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});