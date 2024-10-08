const express = require('express');
const app = express();

// configures express to use ejs 
app.set('view engine', 'ejs');
const PORT = 3000;

// creates a get endpoint
app.get('/', (req, res) => {
    res.send('Welcome to my app');
});

// the endpoint
app.get('/endpoint', (req, res) => {
    let name = 'Guest'; 
    if (req.query.name) {
        name = req.query.name;
    }
    
    let Jan = "Hello, Jan!"; 
    
    res.render('hello', { name: Jan });
});

//Starting the server 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});