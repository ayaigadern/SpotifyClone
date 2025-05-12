import { ref } from 'vue';
import { getAccessToken } from './useSpotify';

let player;
let initializationPromise = null;
const isReady = ref(false);
const currentTrack = ref(null);
const isPlaying = ref(false);
const deviceId = ref(null);

export const initializePlayer = async () => {
  // If already initializing, return the existing promise
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      // Wait for the SDK to be loaded
      let sdkLoadAttempts = 0;
      while (!window.Spotify && sdkLoadAttempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        sdkLoadAttempts++;
      }

      if (!window.Spotify) {
        throw new Error('Spotify Web Playback SDK not loaded after waiting');
      }

      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      if (player) {
        await player.disconnect();
      }

      player = new window.Spotify.Player({
        name: 'Web Playback SDK Player',
        getOAuthToken: cb => {
          const token = getAccessToken();
          cb(token);
        },
        volume: 0.5
      });

      // Set up event listeners
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        deviceId.value = device_id;
        isReady.value = true;
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        isReady.value = false;
        deviceId.value = null;
      });

      player.addListener('player_state_changed', state => {
        if (!state) return;
        
        currentTrack.value = state.track_window.current_track;
        isPlaying.value = !state.paused;
      });

      player.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize', message);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate', message);
      });

      player.addListener('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account', message);
      });

      const connected = await player.connect();
      console.log('Player connected:', connected);
      
      if (!connected) {
        throw new Error('Failed to connect to Spotify Web Playback SDK');
      }

      return true;
    } catch (error) {
      console.error('Error initializing player:', error);
      throw error;
    }
  })();

  return initializationPromise;
};

export const playTrack = async (uri) => {
  if (!player || !isReady.value) {
    console.error('Player not initialized or not ready');
    return;
  }

  if (!deviceId.value) {
    console.error('No device ID available');
    return;
  }

  try {
    console.log('Attempting to play track with URI:', uri);
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify({ uris: [uri] })
    });
    
    console.log('Track is now playing');
    isPlaying.value = true;
  } catch (error) {
    console.error('Error playing track:', error);
  }
};

export const togglePlay = () => {
  if (player) {
    player.togglePlay();
  }
};

export const getPlayerState = () => ({
  isReady,
  currentTrack,
  isPlaying,
});
