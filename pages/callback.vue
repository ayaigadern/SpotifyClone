<template>
  <div>
    <h1>Callback Page</h1>
    <p>Spotify authentication success! You should be redirected shortly.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { setAccessToken } from '../composables/useSpotify';

// Router to handle navigation after successful login
const router = useRouter()

// Spotify Client Credentials
const CLIENT_ID = '25f25e4b2c2a45e599e0f546bacfa179';
const CLIENT_SECRET = '6462a2123fff4c59b0f0a63c0f6ff6d0';

const REDIRECT_URI = 'https://spotify-clone-sage-iota.vercel.app/callback';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Optional: Custom localStorage keys for tokens
const TOKEN_KEY = 'spotify_access_token'
const REFRESH_TOKEN_KEY = 'spotify_refresh_token'
const EXPIRATION_KEY = 'spotify_token_expiration'

// Function to fetch the access token from Spotify
const getAccessToken = async (code) => {
  try {
    const response = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Calculate token expiration time and save tokens to localStorage
    const expirationTime = new Date().getTime() + response.data.expires_in * 1000;
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh_token);
    localStorage.setItem(EXPIRATION_KEY, expirationTime.toString());

    return response.data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

// Function to refresh the access token
const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axios.post(
      TOKEN_URL,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const expirationTime = new Date().getTime() + response.data.expires_in * 1000;
    localStorage.setItem(TOKEN_KEY, response.data.access_token);
    localStorage.setItem(EXPIRATION_KEY, expirationTime.toString());

    if (response.data.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refresh_token);
    }

    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

// Handle token exchange and redirect after successful login
onMounted(async () => {
  if (process.client) {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    
    if (error) {
      console.error('Authentication error:', error);
      router.push('/');
      return;
    }

    if (!code) {
      console.error('No code in URL. Cannot proceed.');
      router.push('/');
      return;
    }

    try {
      const accessToken = await getAccessToken(code);
      setAccessToken(accessToken); // Set the access token for API requests
      if (accessToken) {
        router.push('/dashboard');
      } else {
        console.error('No access token found in redirect.');
        router.push('/');
      }
    } catch (error) {
      console.error('Token exchange failed:', error);
      router.push('/');
    }
  }
});
</script>
