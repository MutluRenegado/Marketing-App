import express from 'express';
import passport from 'passport';
import { OAuth2Strategy } from 'passport-oauth2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import users from './users'; // Import your user database (if separate)

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use environment variable for security

// OAuth Strategy (example)
passport.use(new OAuth2Strategy({
    authorizationURL: process.env.AUTHORIZATION_URL || 'https://www.wix.com/oauth/authorize', // Replace with the Wix OAuth URL
    tokenURL: process.env.TOKEN_URL || 'https://www.wix.com/oauth/token', // Replace with the Wix OAuth token URL
    clientID: process.env.CLIENT_ID || 'CLIENTID', // Replace with your actual CLIENT_ID
    clientSecret: process.env.CLIENT_SECRET || 'SECRETID', // Replace with your actual CLIENT_SECRET
    callbackURL: process.env.CALLBACK_URL || 'https://your-app-url.com/auth/redirect' // Replace with the actual CALLBACK_URL
},
function(accessToken, refreshToken, profile, done) {
    // You can find or create the user based on the OAuth response here
    done(null, profile);
}));

// Sign Up Endpoint
router.post('/signup', async (req, res) => {
    const { name, username, email, password } = req.body;
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
        id: uuidv4(),
        name,
        username,
        email,
        password: hashedPassword,
        isVerified: false,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser); // Replace with your database insertion logic
    res.status(201).json({ message: 'User created' });
});

// Sign In Endpoint (JWT)
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
});

// OAuth2 Login Route
router.get('/login', passport.authenticate('oauth2'));

// OAuth2 Callback Route
router.get('/redirect', passport.authenticate('oauth2', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to home page
        res.redirect('/');
    }
);

// Logout Route
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed', error: err });
        }
        res.redirect('/');
    });
});

export default router;
