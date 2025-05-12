import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

let accessToken = null;

export function setAccessToken(token) {
  console.log('Setting access token:', token); // Debugging log
  accessToken = token;
}

export function getAccessToken() {
  if (!accessToken) {
    // Attempt to retrieve the token from localStorage
    const tokenFromStorage = localStorage.getItem('spotify_access_token');
    if (tokenFromStorage) {
      console.log('Retrieved access token from localStorage:', tokenFromStorage); // Debugging log
      accessToken = tokenFromStorage;
    } else {
      throw new Error('Access token is not set. Please authenticate first.');
    }
  }
  return accessToken;
}

export function useSpotify(){
    ///info 
  const isLoading = ref(false);
      const error = ref(null);
const userProfile = ref(null);
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'your_client_id';
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || 'your_client_secret';
const validateToken = () => {
    const token = localStorage.getItem('spotify_access_token');
    const expiration = localStorage.getItem('spotify_token_expiration');

    if (!token || !expiration) {
      return false;
    }

    return Number(expiration) > new Date().getTime() + 60 * 1000;
  };
    //refresh token
     const refreshToken = async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) {
      router.push('/login');
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        TOKEN_URL,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const expirationTime = new Date().getTime() + response.data.expires_in * 1000;
      localStorage.setItem('spotify_access_token', response.data.access_token);
      localStorage.setItem('spotify_token_expiration', expirationTime.toString());

      if (response.data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', response.data.refresh_token);
      }

      return response.data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      router.push('/login');
      throw error;
    }
  };

    //call api
  const callApi = async (endpoint, options = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      if (!validateToken()) {
        await refreshToken();
      }

      const token = localStorage.getItem('spotify_access_token');
      if (!token) {
        throw new Error('No access token available');
      }

      console.log('API Request:', {
        endpoint,
        method: options.method || 'GET',
        body: options.data ? JSON.stringify(options.data) : null,
      });

      const response = await axios({
        url: `https://api.spotify.com/v1${endpoint}`,
        method: options.method || 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        data: options.data,
      });

      if (response.status === 201 || response.status === 204) {
        return response.data || null;
      }

      return response.data;
    } catch (e) {
      console.error('API Error:', {
        endpoint,
        status: e.response?.status,
        error: e.response?.data?.error?.message || e.message,
        fullError: e.response?.data,
      });

      if (e.response?.status === 401) {
        await refreshToken();
        const newToken = localStorage.getItem('spotify_access_token');
        const retryResponse = await axios({
          url: `https://api.spotify.com/v1${endpoint}`,
          method: options.method || 'GET',
          headers: {
            Authorization: `Bearer ${newToken}`,
            ...options.headers,
          },
          data: options.data,
        });
        if (retryResponse.status === 201 || retryResponse.status === 204) {
          return retryResponse.data || null;
        }
        return retryResponse.data;
      } else if (e.response?.status === 404) {
        throw new Error(`Resource not found (404) - The requested endpoint ${endpoint} was not found`);
      } else if (e.response?.status === 403) {
        throw new Error('Access forbidden - Please check your Spotify account permissions');
      } else if (e.response?.status === 400) {
        throw new Error(`Bad request (400) - ${e.response?.data?.error?.message || JSON.stringify(e.response?.data)}`);
      }
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  //user playlists
    const userPlaylists = ref([]);
    const fetchUserPlaylists = async () => {
    try {
      const data = await callApi('/me/playlists');
      userPlaylists.value = data.items;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  };

  //user Albums 
  const userAlbums=ref([]);
  const fetchUserAlbums = async () => {
    try {
      const data = await callApi('/me/albums');
      userAlbums.value = data.items;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  };
  //user artists
  const userArtists=ref([]);
  const fetchUserArtists = async () => {
    try {
      const data = await callApi('/me/top/artists');
      userArtists.value = data.items;
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  };  //new playlist
const searchResults = ref({ tracks: [], albums: [], artists: [] });

  const searchSpotify = async (query) => {
    try {
      if (!query.trim()) {
        searchResults.value = { tracks: [], albums: [], artists: [],playlists:[] };
        return searchResults.value;
      }
      const data = await callApi(`/search?q=${encodeURIComponent(query)}&type=track,album,artist,playlist&limit=5`);
      searchResults.value = data;
      return data;
    } catch (error) {
      console.error('Error searching Spotify:', error);
      searchResults.value = { tracks: [], albums: [], artists: [],playlists:[] };
      throw error;
    }
  };
  const addTracksToPlaylist = async (playlistId, trackUris) => {
    try {
      if (!playlistId || typeof playlistId !== 'string') {
        throw new Error('Invalid playlist ID');
      }
      if (!Array.isArray(trackUris) || trackUris.length === 0) {
        throw new Error('Track URIs must be a non-empty array');
      }
      const validUris = trackUris.filter((uri) => typeof uri === 'string' && uri.startsWith('spotify:track:'));
      if (validUris.length === 0) {
        throw new Error('No valid track URIs provided');
      }

      console.log('Adding tracks to playlist:', { playlistId, uris: validUris });

      const response = await callApi(`/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          uris: validUris,
        },
      });

      console.log('Add tracks response:', response);
      return response;
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
      throw error;
    }
  };

  const removeTracksFromPlaylist = async (playlistId, trackUris) => {
    try {
      if (!playlistId || typeof playlistId !== 'string') {
        throw new Error('Invalid playlist ID');
      }
      if (!Array.isArray(trackUris) || trackUris.length === 0) {
        throw new Error('Track URIs must be a non-empty array');
      }
      const validUris = trackUris.filter((uri) => typeof uri === 'string' && uri.startsWith('spotify:track:'));
      if (validUris.length === 0) {
        throw new Error('No valid track URIs provided');
      }

      console.log('Removing tracks from playlist:', { playlistId, uris: validUris });

      const response = await callApi(`/playlists/${playlistId}/tracks`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          tracks: validUris.map((uri) => ({ uri })),
        },
      });

      console.log('Remove tracks response:', response);
      return response;
    } catch (error) {
      console.error('Error removing tracks from playlist:', error);
      throw error;
    }
  };

  const updatePlaylist = async (playlistId, details) => {
    try {
      if (!playlistId || typeof playlistId !== 'string') {
        throw new Error('Invalid playlist ID');
      }
      if (!details || typeof details !== 'object') {
        throw new Error('Invalid playlist details');
      }

      console.log('Updating playlist details:', { playlistId, details });

      const response = await callApi(`/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        data: details,
      });

      console.log('Update playlist response:', response);
      return response;
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  };
    
    const fetchUserProfile = async () => {
    try {
      const data = await callApi('/me');
      userProfile.value = data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };
    const createPlaylist = async (name = 'Nouvelle playlist', description = '', isPublic = false) => {
        console.log(userProfile)
    try {
      if (!userProfile.value?.id) {
        throw new Error('User profile not loaded');
      }
      if (!name.trim()) {
        throw new Error('Playlist name is required');
      }
      if (name.length > 100) {
        throw new Error('Playlist name must be 100 characters or less');
      }

      const response = await callApi(`/users/${userProfile.value.id}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          name: name.trim(),
          description: description.trim(),
          public: isPublic,
        },
      });

      await fetchUserPlaylists();
      return response;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  };

  

  
  return{
    userProfile,
    userPlaylists,
    fetchUserPlaylists,
    fetchUserProfile,
    fetchUserAlbums,
    userAlbums,
    fetchUserArtists,
    userArtists,
    searchResults,
    searchSpotify,
    createPlaylist,
    addTracksToPlaylist,
    removeTracksFromPlaylist,
    updatePlaylist,
    getAccessToken,

  };

}