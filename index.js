// OAuth app setup for Wix with Railway deployment

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your OAuth app details
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://intelligent-creativity.up.railway.app/oauth/redirect";

// Step 1: Authorization URL
app.get('/oauth', (req, res) => {
    const authUrl = `https://www.wix.com/oauth/access?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    res.redirect(authUrl);
});

// Step 2: Handling redirect
app.get('/oauth/redirect', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    try {
        const tokenResponse = await axios.post('https://www.wix.com/oauth/access', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI
        });

        const accessToken = tokenResponse.data.access_token;
        res.send(`Access token received: ${accessToken}`);
    } catch (error) {
        console.error('Error fetching access token:', error);
        res.status(500).send('Failed to fetch access token');
    }
});

// Step 3: Add a root route
app.get('/', (req, res) => {
    res.send('Wix OAuth App is running. Navigate to /oauth to initiate authentication.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Create .env file with the following variables:
// CLIENT_ID=your_client_id_here
// CLIENT_SECRET=your_client_secret_here
