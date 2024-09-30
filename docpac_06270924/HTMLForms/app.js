const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse POST request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define a route for the home page
app.get('/', (req, res) => {
  res.render('index');
});

// Define a route for the add page
app.get('/add', (req, res) => {
  res.render('add');
});

app.post('/add', (req, res) => {
  try {
    // Validate POST parameters
    const { name, Q1, Q2, Q3 } = req.body;
    if (!name || !Q1 || !Q2 || !Q3) {
      throw new Error("YOU AREN'T SIGMA");
    }

    // Create form data object
    const formData = { name, Q1, Q2, Q3 };

    app.get('/view', (req, res) => {
      // Read data.json file
      const dataPath = path.join(__dirname, 'data.json');
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      let data;

      try {
        data = JSON.parse(fileContent);
        if (!Array.isArray(data)) {
          throw new Error('Data is not an array');
        }
      } catch (error) {
        data = [];
      }

      res.render('view', { data });
    });
    // Push form data into data array
    data.push(formData);

    // Convert the updated data back to a string
    const updatedData = JSON.stringify(data, null, 2);

    // Write the string to the data.json file, overwriting its contents
    fs.writeFileSync(dataPath, updatedData);

    // Redirect to home page
    res.redirect('/');
  } catch (error) {
    res.status(400).send(error.message);
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});