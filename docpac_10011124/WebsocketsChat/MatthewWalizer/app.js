const express = require('express')
const app = express()

app.use(express.urlencoded({ extended: true }))
app.listen(3000, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Server running on port 3000!");
        
    }
})
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('index')
})

app.get('/chat', (req, res) => {
    if (req.query.name) {
        res.render('chat', {localName: req.query.name})
    } else {
        res.redirect('/')
    }
})
