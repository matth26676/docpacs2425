const PORT = 3000;
const ejs = require("ejs");
const https = require('https');
const fs = require('fs');
const path = require('path');

var express = require('express');
var app = express();

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/add', function (req, res) {
  res.render('add');
});

app.post('/add', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new Error('Username and password are required.');
    }

    // Read the existing data from data.json
    const dataPath = path.join(__dirname, 'data.json');
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading data.json:', err);
        return res.status(500).render('error', { error: 'Internal Server Error' });
      }

      // Parse the existing data
      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error parsing data.json:', parseErr);
        return res.status(500).render('error', { error: 'Internal Server Error' });
      }

      // Ensure jsonData.data is an array
      if (!Array.isArray(jsonData.data)) {
        jsonData.data = [];
      }

      // Append the new data
      jsonData.data.push({ username, password });

      // Write the updated data back to data.json
      fs.writeFile(dataPath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          console.error('Error writing to data.json:', err);
          return res.status(500).render('error', { error: 'Internal Server Error' });
        }

        // Redirect to the root directory
        res.redirect('/');
      });
    });
  } catch (error) {
    res.status(400).render('error', { error: error.message });
  }
});

app.get('/view', function (req, res) {
  // Read the existing data from data.json
  const dataPath = path.join(__dirname, 'data.json');
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Parse the existing data
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing data.json:', parseErr);
      return res.status(500).send('Internal Server Error');
    }

    const entry = req.query.entry;
    let filteredData = jsonData.data;

    if (entry) {
      filteredData = jsonData.data.filter(user => user.username === entry);
    }

    res.render('view', { data: filteredData, entry });
  });
});

app.listen(PORT, () => {
  console.log('Server is listening on port', PORT);
});