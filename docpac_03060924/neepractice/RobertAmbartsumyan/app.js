const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

//taking the user to index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/endpoint', (req, res) => {
  let name = 'Guest';
  
  if (req.query.name) {
    name = req.query.name;
  }

  res.render('index.ejs', {name: name});

});


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});