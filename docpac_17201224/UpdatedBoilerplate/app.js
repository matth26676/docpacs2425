const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const app = express();
const routes = require('./modules/routes'); // Adjusted path to routes.js
const handleSocketConnection = require('./modules/socket'); // Import the socket handler

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Adjust the path to your views folder if necessary

app.use('/', routes); // Use the routes for the root path

const server = http.createServer(app);
handleSocketConnection(server); // Pass the server to the socket handler

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});