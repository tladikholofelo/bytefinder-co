require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB Connected');
    })
    .catch((err) => {
        console.error('MongoDB Connection Error:', err);
    });

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Specify the folder where your views are located (default is 'views' folder)
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' folder
app.use(express.static('public', { 'extensions': ['html', 'htm'] }));

// Setup express-session using the session from the environment variable '.env'
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// Setup passport
app.use(passport.initialize());
app.use(passport.session());

// Use User Model 
const User = require('./models/user');

// Passport Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'identifier',
    passwordField: 'password'
}, async (identifier, password, done) => {
    try {
        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }]
        });

        if (!user) {
            return done(null, false, { message: 'Incorrect username or email.' });
        }

        const authenticated = await user.authenticate(password);

        if (!authenticated) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Use connect-flash middleware
app.use(flash());

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to check if the user is logged in
function isLoggedIn(req, res, next) {
    console.log('Session data:', req.session);
    console.log('Deserialized user:', req.user);
    console.log('Checking authentication status:', req.isAuthenticated());

    if (req.isAuthenticated()) {
        return next();
    }

    // Redirect to login only if the current route is not /login
    if (req.originalUrl !== '/login') {
        return res.redirect('/login');
    }

    // If the current route is /login, render the login page
    res.render('login');
}

// GET route for '/'
app.get('/', (req, res) => {
    res.render('index'); // Replace 'index' with the actual name of your home page or the route you want to render.
});

// GET route to render /views/login.ejs
app.get('/login', (req, res) => {
    res.render('login'); // Assuming 'login.ejs' is in your 'views' folder
});

// POST route for handling login form submission
app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true  // Enable flash messages for authentication failures
}), (req, res) => {
    console.log('User authenticated:', req.isAuthenticated());
});

// Use routes in 'auth.js'
app.use(require('./routes/auth'));

// GET route to redirect to 'registration-success.ejs' success page
app.get('/registration-success', (req, res) => {
    res.render('registration-success'); 
});

// GET route to render 'home.ejs'
app.get('/home', isLoggedIn, (req, res) => {
    res.render('home');
});

// GET route to render 'bookmarked-jobs.ejs'
app.get('/bookmarked-jobs', isLoggedIn, (req, res) => {
    res.render('bookmarked-jobs');
});

// GET route to render 'featured-jobs.ejs' 
app.get('/featured-jobs', isLoggedIn, (req, res) => {
    res.render('featured-jobs');
});

// POST route to edit user personal information 
app.post(
    '/edit-profile',
    isLoggedIn,
    [
        body('fullName').trim().notEmpty().withMessage('Full Name is required'),
        body('surname').trim().notEmpty().withMessage('Surname is required'),
        body('username').trim().notEmpty().withMessage('Username is required'),
        body('email').trim().isEmail().withMessage('Invalid email address'),
    ],
    async (req, res, next) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If it's an AJAX request, respond with JSON
            if (req.xhr) {
                return res.status(400).json({ errors: errors.array() });
            }

            // If it's a regular request, redirect to the profile page with errors
            return res.status(400).redirect('/profile?error=true');
        }
  
        try {
            const { username, email, fullName, surname } = req.body;

            const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { username, email, fullName, surname } },
            { new: true }
            );
    
            req.login(updatedUser, (err) => {
            if (err) {
                return next(err);
            }
            console.log('User object in session updated:', req.user);
            });

            // If it's an AJAX request, respond with success
            if (req.xhr) {
                return res.status(200).json({ message: 'Profile updated successfully!' });
            }

            // If it's a regular request, redirect to the profile page
            res.redirect('/profile');
            } catch (error) {
            console.error('Profile update error:', error);
            next(error);
        }
    }
);

// Edit experience
app.get('/edit-experience', isLoggedIn, (req, res) => {
    res.render('edit-experience', { user: req.user });
});

// Handle the form submission
app.post('/edit-experience', isLoggedIn, async (req, res, next) => {
    try {
        const { title, company, startDate, endDate, description } = req.body;

        // Update the user's experiences
        req.user.experiences.push({
            title,
            company,
            startDate,
            endDate,
            description,
        });

        // Save the updated user
        await req.user.save();

        res.redirect('/profile'); // Redirect to the profile
    } catch (error) {
        console.error('Edit experience error:', error);
        next(error);
    }
});

// Route handler for logout
app.get('/logout', function(req, res) {
    req.logout(); 
    res.redirect('/');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
