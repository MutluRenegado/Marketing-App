import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const users = []; // Temporary storage, replace with database integration
const JWT_SECRET = 'your_jwt_secret'; // Change this to a secure secret

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
    
    users.push(newUser); // Store user (replace with database insertion)
    res.status(201).json({ message: 'User created' });
});

// Sign In Endpoint
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

export default router;
