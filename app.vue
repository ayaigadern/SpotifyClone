<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { initializePlayer } from './composables/useWebPlayer';

// Load Spotify SDK and initialize player
onMounted(async () => {
  if (process.client) {
    try {
      // Create and load the Spotify SDK script
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      // Initialize the player once the SDK is ready
      window.onSpotifyWebPlaybackSDKReady = async () => {
        console.log('Spotify SDK Ready, initializing player...');
        await initializePlayer();
      };

      // Append the script to the document
      document.body.appendChild(script);
    } catch (error) {
      console.error('Error loading Spotify SDK:', error);
    }
  }
});
</script>
