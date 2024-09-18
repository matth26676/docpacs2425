const express = require('express')
var app = express();


app.set('view engine', 'ejs');



app.get('/', (req, res) => {
    res.render('root');
});

app.get('/endpoint', (req, res) => {
    let name = req.query.name || 'Guest';  // Fallback to 'Guest' if no name is provided
    res.render('endpoint', { name: name });
});
    


app.listen(1000, () => {
    console.log('Server is listening on port 1000')
});
