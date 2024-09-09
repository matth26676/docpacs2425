// Import the Express module
const express = require('express');
const path = require('path');
const http = require('http');

// Create an instance of an Express application
const app = express();

// Define a port number
const port = 3000;
app.set('view engine', 'ejs');

// Define a root GET endpoint that responds by sending an HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
  const name = "Guest";
});

//if (name == "Guest") {
  app.get('/guest', (req, res) => {
  res.render('index');
});

// Create an HTTP server
const server = http.createServer(app);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});