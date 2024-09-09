const express = require('express')
const app = express()
const path = require('path')
const port = "3000"

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/ejs', (req, res) => {
    var name = "Guest"

    if (req.query.name) {
        name = req.query.name
    }
    
    res.render('index', {name: name})
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})