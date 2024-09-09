const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Set the directory where the template files are located
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse the body of POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (e.g., favicon)
app.use(express.static(path.join(__dirname, 'public')));

// Set CSP headers
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' http://localhost:3000");
  next();
});

// Define a route to render the page.ejs file
app.get('/', (req, res) => {
  const name = req.query.name || null;
  res.render('page', { name: name });
});

// Handle form submission
app.post('/', (req, res) => {
  const name = req.body.name;
  res.redirect(`/?submitted=true&name=${encodeURIComponent(name)}`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});