// OAuth app setup for Wix with Railway deployment

import express from 'express'; // Use import syntax
import axios from 'axios'; // Use import syntax
import authRoutes from './auth.js'; // Import authentication routes
import dotenv from 'dotenv'; // Use import syntax
dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000; // Default to 3000 locally

app.use(express.json());
app.use('/auth', authRoutes); // Attach authentication routes

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
