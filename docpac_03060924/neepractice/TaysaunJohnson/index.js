var express = require('express')
var app = express()

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('root')
})

app.get('/game', (req, res) => {
    var name = ""
    if (!req.query.name) {
        name = "Guest"
    } else {
        name = req.query.name
    }
    res.render('game', {name : name})
})

app.listen(3000, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("Listening on port 3000")
    }
})