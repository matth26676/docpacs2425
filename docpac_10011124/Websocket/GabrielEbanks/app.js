const {  log  } = require('console');

app.get('/', (req, res) => {
    res.render('index'); // Renders the index view
});


app.get('/chat', (req, res) => {
    res.render('chat'); // Renders the index view
});





























// Start the Express server on port 3000
app.listen(3000, () => {
    console.log(`Server started on port 3000`); // Log confirmation message
});
