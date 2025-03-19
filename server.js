import dotenv from 'dotenv';  // Load environment variables
import express from 'express'; // Import Express
import axios from 'axios';     // Import Axios for HTTP requests
import qs from 'querystring';  // Import querystring to format POST data

dotenv.config(); // Load environment variables from .env file

const app = express(); // Create an Express app

// OAuth callback route
app.get('/oauth/callback', async (req, res) => {
    const code = req.query.code; // Retrieve authorization code

    if (!code) {
        return res.status(400).json({ error: 'Authorization code is missing.' });
    }

    try {
        // Exchange authorization code for access token
        const response = await axios.post('https://www.wix.com/oauth/access_token', qs.stringify({
            code: code,
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token } = response.data; // Extract tokens
        console.log('Access Token:', access_token);
        if (refresh_token) {
            console.log('Refresh Token:', refresh_token);
        }

        // Redirect user to frontend with access token (or store it securely)
        res.redirect(`${process.env.FRONTEND_URL}/success?token=${access_token}`);
    } catch (error) {
        console.error('OAuth error:', error.response?.data || error.message);
        res.status(500).json({ error: 'OAuth authentication failed.', details: error.response?.data });
    }
});

// Vercel automatically handles server listening, so no need for `app.listen()`

export default app; // Ensure Vercel handles it properly
