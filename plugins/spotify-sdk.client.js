// Spotify Web Playback SDK initialization
import { initializePlayer } from '../composables/useWebPlayer';

export default defineNuxtPlugin(async (nuxtApp) => {
  if (!process.client) return;

  const loadSpotifySDK = () => {
    return new Promise((resolve) => {
      if (window.Spotify) {
        resolve();
        return;
      }

      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('Spotify Web Playback SDK Ready');
        resolve();
      };

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    });
  };

  await loadSpotifySDK();
  
  // Add a small delay to ensure SDK is fully initialized
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    provide: {
      spotifySDKReady: true
    }
  };
});
