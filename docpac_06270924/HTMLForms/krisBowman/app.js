const express=require("express"); // add express module
const app = express(); //express into object for furture usage

const PORT = process.env.PORT ||5000; //port number

// Handle GET request
app.get('/', (req, res) => { 
    res.render('index.ejs'); 
}) 

app.get('/add', (req, res) => { 
    res.render('add.ejs'); 
}) 

//$.post("/data.json",)
// Handle POST request
app.post('/add', (req, res) => { 
    fs.read(buffer, 0, buffer.length, 0, function(err, bytes) {
            if (err) {
                console.log(err)
            }
            if (bytes > 0) {
                console.log(buffer.
                    slice(0, bytes).toString());
            }
            console.log(bytes + " bytes read");

            // Close the opened file.
            fs.close(fd, function (err) {
                if (err) {
                    console.log(err);
                }

                console.log("File closed successfully");
            });
        });
});


// Server Setup
app.listen(PORT,console.log(
  `Server started on port ${PORT}`));