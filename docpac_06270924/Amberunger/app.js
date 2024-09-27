const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const port = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the "public" folder
app.set('view engine', 'ejs');

// Session setup
app.use(session({
    secret: 'your_secret_key', // Use a strong, random secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set true if using https
}));

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.render('error', { message: 'Logout failed. Please try again.' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/login');
    });
});

// Middleware to check if user is logged in
function checkAuth(req, res, next) {
    if (req.session.user) {
        next(); // User is authenticated
    } else {
        res.redirect('/login'); // Redirect to login if not authenticated
    }
}

// Initialize the data file (data.json)
const initDataFile = () => {
    if (!fs.existsSync('data.json')) {
        fs.writeFileSync('data.json', JSON.stringify({ users: [], tracks: [] }, null, 2));
    }
};

initDataFile();

// Route: Home page
app.get('/', (req, res) => {
    const loggedIn = !!req.session.user;
    res.render('index', { loggedIn, user: req.session.user });
});

// Route: Register a new account
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('data.json', (err, data) => {
        if (err) throw err;

        let usersData = JSON.parse(data);

        // Check if the username already exists
        const userExists = usersData.users.find(user => user.username === username);
        if (userExists) {
            return res.render('error', { message: 'Username already exists!' });
        }

        // Hash the password and create user entry
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) throw err;

            // Add the new user to the users array (setting isAdmin to false by default)
            usersData.users.push({ username, password: hashedPassword, isAdmin: false });

            // Save the updated data back to the file
            fs.writeFile('data.json', JSON.stringify(usersData, null, 2), (err) => {
                if (err) throw err;
                res.redirect('/login');
            });
        });
    });
});

// Route: GET Add Track page
app.get('/add', checkAuth, (req, res) => {
    res.render('add');
});

// Route: Add a track (POST request)
app.post('/add', checkAuth, (req, res) => {
    const { title, artist, duration, image, video, album, genre } = req.body;

    // Validate required inputs
    if (!title || !artist || !duration || !video) {
        return res.render('error', { message: 'All required fields must be filled out!' });
    }

    const newTrack = {
        id: Date.now(),
        title,
        artist,
        duration,
        image: image || null,
        video,
        album: album || null,
        genre: genre || null,
        user: req.session.user, // Associate the logged-in user with the track
    };

    // Read and update data.json
    fs.readFile('data.json', (err, data) => {
        if (err) throw err;

        const fileData = JSON.parse(data);
        fileData.tracks.push(newTrack); // Add the new track to the list

        // Save the updated data back to the file
        fs.writeFile('data.json', JSON.stringify(fileData, null, 2), (err) => {
            if (err) throw err;
            res.redirect('/view'); // Redirect to the view page after adding a track
        });
    });
});

// Route: View Tracks
app.get('/view', checkAuth, (req, res) => { // Ensure checkAuth middleware is used
    fs.readFile('data.json', (err, data) => {
        if (err) throw err;

        const fileData = JSON.parse(data);
        const tracks = fileData.tracks;

        res.render('view', { tracks });
    });
});

// Route: Display login form
app.get('/login', (req, res) => {
    res.render('login');
});

// Route: Handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile('data.json', (err, data) => {
        if (err) throw err;

        const usersData = JSON.parse(data);

        // Find the user by username
        const user = usersData.users.find(user => user.username === username);

        if (!user) {
            return res.render('error', { message: 'Invalid username or password!' });
        }

        // Compare the provided password with the hashed password
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) throw err;

            if (result) {
                // Password matches, set session and redirect to home
                req.session.user = username;
                req.session.isAdmin = user.isAdmin; // Store if the user is an admin
                res.redirect('/');
            } else {
                // Password does not match
                res.render('error', { message: 'Invalid username or password!' });
            }
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});