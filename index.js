// OAuth app setup for Wix with Railway deployment

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// OAuth app details from environment variables
const CLIENT_ID = process.env.CLIENT_ID; // Set in Railway dashboard
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Set in Railway dashboard
const REDIRECT_URI = process.env.REDIRECT_URI || "https://intelligent-creativity.up.railway.app/oauth/redirect";

// Step 1: Authorization URL
app.get('/oauth', (req, res) => {
    try {
        const authUrl = `https://www.wix.com/oauth/access?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
        res.redirect(authUrl);
    } catch (error) {
        console.error('Error generating authorization URL:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Step 2: Handling redirect and token exchange
app.get('/oauth/redirect', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Authorization code is missing.');
    }

    try {
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

// Step 3: Root route for health check
app.get('/', (req, res) => {
    res.send('Wix OAuth App is running. Navigate to <a href="/oauth">/oauth</a> to initiate authentication.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Instructions for .env file:
// CLIENT_ID and CLIENT_SECRET are securely stored in Railway's environment variables.
// REDIRECT_URI can also be set in the environment or defaults to production URI.
