// Import necessary packages
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import authRoutes from './auth.js'; // Assuming you have separate routes for authentication

// Initialize environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use('/auth', authRoutes); // Authentication routes, handled in separate auth.js file

// OAuth app details from environment variables
const CLIENT_ID = process.env.CLIENT_ID; 
const CLIENT_SECRET = process.env.CLIENT_SECRET; 
const REDIRECT_URI = process.env.REDIRECT_URI || "https://ouath-app.up.railway.app/oauth/redirect"; // Fallback if not set in env

// Step 1: Generate OAuth Authorization URL
app.get('/oauth', (req, res) => {
  try {
    const authUrl = `https://www.wix.com/oauth/access?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating authorization URL:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Step 2: Handle redirect from Wix and exchange code for access token
app.get('/oauth/redirect', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code is missing.');
  }

  try {
    // Send request to exchange the authorization code for an access token
    const tokenResponse = await axios.post(
      'https://www.wix.com/oauth/access_token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;
    res.send(`Access token received: ${accessToken}`);
  } catch (error) {
    console.error('Error fetching access token:', error.response?.data || error.message);
    res.status(500).send('Failed to fetch access token.');
  }
});

// Step 3: Root route for health check or any initial setup
app.get('/', (req, res) => {
  res.send('Wix OAuth App is running. Navigate to <a href="/oauth">/oauth</a> to initiate authentication.');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
