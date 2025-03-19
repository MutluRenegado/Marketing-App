import dotenv from 'dotenv';  // Using ES Module import to load environment variables
import express from 'express'; // Using ES Module import for Express
import axios from 'axios';     // Using ES Module import for Axios to make HTTP requests
import qs from 'querystring';   // Import querystring to format data for POST request

// Load environment variables from the .env file
dotenv.config();

const app = express();

// OAuth callback route to handle the redirect after authorization
app.get('/oauth/callback', async (req, res) => {
    const code = req.query.code; // The authorization code passed in the query params

    // Check if the authorization code is provided
    if (!code) {
        return res.status(400).send('Authorization code is missing.');
    }

    try {
        // Exchange the authorization code for an access token
        const response = await axios.post('https://www.wix.com/oauth/access_token', qs.stringify({
            code: code,
            client_id: process.env.CLIENT_ID,  // Use environment variables for security
            client_secret: process.env.CLIENT_SECRET,  // Use environment variables for security
            redirect_uri: process.env.REDIRECT_URI  // Use the redirect URI from the environment variable
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Set content type to x-www-form-urlencoded
            }
        });

        const accessToken = response.data.access_token; // Get the access token from the response

        // Optionally, you can store the access token in a session or database
        console.log('Access Token:', accessToken);

        // Respond with a success message or a redirect to your frontend
        res.send('OAuth authentication successful!');
    } catch (error) {
        console.error('Error exchanging code for access token:', error);
        if (error.response) {
            // If the error is from the API, you can get the response details
            console.error('Error Response:', error.response.data);
        }
        res.status(500).send('OAuth authentication failed.');
    }
});

// Remove the manual `listen()` method as Vercel will automatically handle the server and URL
