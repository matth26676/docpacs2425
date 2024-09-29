const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const dataFilePath = "./data.json";
const PORT = 3000;

//Isaiah came up with "Isaiah Watermelon" himself. Please do not report me for being racist.
const brands = ['Hayden Super Sigma Soda', 'STEVEN!', 'Isaiah Watermelon', 'Yeagermeister Cream', 'Robert квас', 'Jesse Gingerale'];

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the views directory
app.set('/', path.join(__dirname, '/'));

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/view', (req, res) => {

    try {

        fs.readFile(dataFilePath, (err, contents) => {
            if(err) throw err;
            let data = JSON.parse(contents);
            res.render('view', {data: data, brands: brands});
        });

    } catch(err){
        res.render('error', {error: err.message});
    }

});

app.get('/add', (req, res) => {
    res.render('add', {brands: brands});
});

app.post('/add', (req, res) => {

    try {

        let formData = {
            brandID: +req.body.brand, // This is shorthand for converting to a number
            quantity: +req.body.quantity,
            note: req.body.note
        }

        console.log(formData);

        //Brand ID validation
        if(typeof formData.brandID === 'undefined') throw new Error("Brand required.");
        if(typeof brands[formData.brandID] === 'undefined' || isNaN(formData.brandID)) throw new Error("Invalid Brand ID");

        //Quantity validation
        if(typeof formData.quantity === 'undefined') throw new Error("Quantity required.");
        if(isNaN(formData.quantity) || formData.quantity <= 0) throw new Error("Invalid Quantity.");

        //As you can probably see, I'm very paranoid about hackers hacking our beloved soda company.
        formData.note.replace('"', '\"');

        let fileData;

        fs.readFile(dataFilePath, (err, contents) => {
            if(err) throw err;
            fileData = JSON.parse(contents);
            fileData.data.push(formData);
            fs.writeFile(dataFilePath, JSON.stringify(fileData), () => {
                res.redirect('/');
            });
        });

    } catch(err) {
        res.render('error', {error: err.message});
    }

});
