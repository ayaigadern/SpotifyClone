<template>
  <div class="flex items-center justify-center h-screen">
    <button @click="login" class="bg-green-500 text-white px-4 py-2 rounded">
      Login with Spotify
    </button>
  </div>
</template>

<script setup>

// Spotify API URLs
const BASE_URL = 'https://api.spotify.com/v1';
const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Client credentials
const CLIENT_ID = '25f25e4b2c2a45e599e0f546bacfa179';
const CLIENT_SECRET = '6462a2123fff4c59b0f0a63c0f6ff6d0';
// Use the public URL for the redirect
const REDIRECT_URI = 'https://661b-196-200-180-30.ngrok-free.app/callback';
const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-library-modify',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-top-read',
    'user-follow-read',
    'user-follow-modify'
].join(' ');

// Local storage keys
const TOKEN_KEY = 'spotify_access_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const EXPIRATION_KEY = 'spotify_token_expiration';



const getAuthUrl = () => {
    return `${AUTH_URL}?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&show_dialog=true`;
};

function login(){
  const authUrl=getAuthUrl();
  window.location.href=authUrl;
}

</script>
