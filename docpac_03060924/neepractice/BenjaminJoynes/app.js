const { name } = require('ejs');
var express = require('express');
var app = express();

app.set('view engine', 'ejs')

app.get('/', (req, res) =>{
    res.render('index') 
})

app.get('/guest', (req, res) => {
    const name = req.query.name || "guest"
    res.render('guest.ejs', {name})
    {name}
})

app.listen(3000, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Port 3000')
    }
})