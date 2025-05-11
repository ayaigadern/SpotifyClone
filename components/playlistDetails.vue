<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { getAccessToken } from '../composables/useSpotify';

const props = defineProps({
  playlist: {
    type: Object,
    required: true,
  },
});

const tracks = ref([]);
const totalDuration = ref(0);
const isLoading = ref(true);
const error = ref(null);

const fetchTracks = async () => {
  if (!props.playlist?.tracks?.href) {
    error.value = 'No tracks available for this playlist';
    isLoading.value = false;
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    const token = getAccessToken();
    console.log('Fetching tracks with token:', token);
    console.log('Playlist tracks URL:', props.playlist.tracks.href);
    
    const response = await axios.get(props.playlist.tracks.href, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    // Extract tracks from the response and calculate total duration
    tracks.value = response.data.items.map(item => {
      if (!item.track) {
        console.warn('Track item is missing track data:', item);
        return null;
      }
      return {
        id: item.track.id,
        name: item.track.name,
        duration_ms: item.track.duration_ms,
        artists: item.track.artists,
        album: item.track.album,
        uri: item.track.uri
      };
    }).filter(track => track !== null);

    totalDuration.value = tracks.value.reduce((sum, track) => sum + track.duration_ms, 0);
    console.log('Tracks loaded:', tracks.value.length);
  } catch (err) {
    console.error('Error fetching tracks:', err);
    error.value = 'Failed to load tracks. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Watch for changes in the playlist prop
watch(() => props.playlist, (newPlaylist) => {
  console.log('Playlist changed:', newPlaylist);
  if (newPlaylist && newPlaylist.id) {
    fetchTracks();
  }
}, { immediate: true });

// Format duration from milliseconds to MM:SS
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="playlist-details min-h-screen">
    <!-- Playlist Header -->
    <div class="p-8">
      <div class="flex items-end space-x-6">
        <img 
          :src="playlist.images?.[0]?.url" 
          :alt="playlist.name"
          class="h-60 w-60 object-cover shadow-2xl"
        />
        <div class="text-white">
          <p class="text-sm font-bold">PLAYLIST</p>
          <h1 class="text-7xl font-extrabold mt-3 mb-6">{{ playlist.name || 'Loading...' }}</h1>
          <div v-if="!isLoading" class="flex items-center text-sm text-gray-300 space-x-1">
            <span class="font-bold">{{ playlist.owner?.display_name }}</span>
            <span v-if="tracks.length">
              <span class="mx-1">•</span>
              <span>{{ tracks.length }} titres</span>
              <span v-if="totalDuration" class="mx-1">•</span>
              <span v-if="totalDuration">{{ Math.floor(totalDuration / 60000) }} min</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="px-8 py-4 text-gray-300 animate-pulse">
      Loading tracks...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-8 py-4 text-red-500">
      {{ error }}
    </div>

    <!-- Track List -->
    <div v-else class="px-8 pb-8">
      <!-- Track Headers -->
      <div class="grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 border-b border-gray-700 text-gray-400 text-sm sticky top-0 bg-[#121212]/95 backdrop-blur-sm z-10">
        <div>#</div>
        <div>TITRE</div>
        <div>ALBUM</div>
        <div class="text-right">DURÉE</div>
      </div>

      <!-- No Tracks Message -->
      <div v-if="tracks.length === 0" class="text-gray-400 text-center py-8">
        Cette playlist ne contient aucun titre
      </div>

      <!-- Tracks -->
      <div v-else class="mt-2">
        <div 
          v-for="(track, index) in tracks" 
          :key="track.id"
          class="group grid grid-cols-[16px_4fr_2fr_1fr] gap-4 px-4 py-2 hover:bg-[#2a2a2a] rounded-md transition-colors duration-200"
        >
          <!-- Track Number -->
          <div class="flex items-center">
            <span class="text-gray-400 text-sm group-hover:hidden">{{ index + 1 }}</span>
            <button class="hidden group-hover:block text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Title and Artist with Album Art -->
          <div class="flex items-center min-w-0">
            <div class="w-10 h-10 flex-shrink-0 mr-3 relative">
              <img 
                :src="track.album?.images?.[2]?.url || '/default-album.png'" 
                :alt="track.album?.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-white font-normal truncate hover:underline cursor-pointer">{{ track.name }}</span>
              <div class="text-sm text-gray-400 truncate">
                <template v-for="(artist, artistIndex) in track.artists" :key="artist.id">
                  <span class="hover:text-white hover:underline cursor-pointer">{{ artist.name }}</span>
                  <span v-if="artistIndex < track.artists.length - 1">, </span>
                </template>
              </div>
            </div>
          </div>

          <!-- Album -->
          <div class="flex items-center text-gray-400 text-sm truncate">
            <span class="hover:text-white hover:underline cursor-pointer">{{ track.album?.name }}</span>
          </div>

          <!-- Duration -->
          <div class="flex items-center justify-end text-gray-400 text-sm">
            {{ formatDuration(track.duration_ms) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-details {
  background: linear-gradient(rgba(0, 0, 0, 0.5) 0, #121212 100%);
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>