const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const User = require('../models/user'); 
const router = express.Router();

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

// Middleware for routes that require authentication
router.use(isLoggedIn);

// Login Form 'login.ejs'
router.get('/login', (req, res) => {
    res.render('login'); 
});

// Login Logic
router.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true // Enable flash messages for authentication failures
}), (req, res) => {});

// Registration Form
router.get('/register', (req, res) => {
    res.render('register');
});

// Registration Logic 
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        await newUser.setPassword(password);
        await newUser.save();

        console.log('User registered successfully:', newUser);

        // Manually authenticate the user after registration
        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            console.log('User authenticated after registration:', req.isAuthenticated());
            console.log('Deserialized user after registration:', req.user);
        });

        res.redirect('/registration-success');
    } catch (error) {
        console.error('Registration error:', error);
        next(error);
    }
}); 

// Profile Page
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { user: req.user });
});

// Edit Profile Page
router.get('/profile/edit', isLoggedIn, (req, res) => {
    res.render('edit-profile', { user: req.user });
});

// Handle Editing Profile
router.post('/edit-profile', isLoggedIn, async (req, res) => {
    try {
        const { username, email, fullName, surname } = req.body;

        // Make sure User.findByIdAndUpdate method exists
        await User.findByIdAndUpdate(req.user._id, { username, email, fullName, surname });

        // Redirect to the profile page after editing
        res.redirect('/profile');
    } catch (error) {
        console.error('Profile edit error:', error);
        // Handle errors appropriately (render an error page or redirect, etc.)
        res.redirect('/error');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
