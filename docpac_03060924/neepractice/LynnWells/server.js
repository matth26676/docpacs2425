import express from 'express';
// import path from 'path';
// import {views\img1.jpg} from 'url';

//Sets default server parameters
// const express = require('express');
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const app = express();
const hostname = '127.0.0.1';
const port = 3000;

// const { createServer } = require('node:http');
// const server = createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('Hello World');
// });

//Its EJS now lol
app.set('view engine', 'ejs')
app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'views')));
app.get('/shutdown', (req, res) => {
    res.send('Shutting down...');
    process.exit(1); // kill
});
// app.get('/', (req, res) => {
//     res.render('index', { name: 'User' });
// });
app.get('/', (req, res) => {
    res.render('index', { title: 'Hey', message: 'Hello there!' })
});

app.get('/endpoint', (req, res) => {
    const name = req.query.name || "guest";
    res.render('endpoint', { name })
});

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
