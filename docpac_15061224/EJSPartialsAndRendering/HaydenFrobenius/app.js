const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get('/print', (req, res) => {
    res.send("Printed");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});