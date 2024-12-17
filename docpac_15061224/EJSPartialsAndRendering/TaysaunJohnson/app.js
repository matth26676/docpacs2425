const express = require('express')
const fs = require('fs')
const ejs = require('ejs')
const app = express()

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index', {viewport: 'online'})
})

app.get('/print', (req, res) => {
//     fs.writeFileSync('index.html', `
// <%- include('../partials/head.ejs') %>
// <body>
//     <h1>My New Project</h1>
//     <% if (viewport == 'online') { %>
//         <a href="/print"><button>Print</button></a>
//     <% } %>
// </body>
// <%- include('../partials/foot.ejs') %>
//     `)
    ejs.renderFile('./views/index.ejs', {viewport: "offline"}, (err, template) => {
        fs.writeFileSync('index.html', template)
        res.send('I think it worked')
    })
})

app.listen(3000)