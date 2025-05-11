<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSpotify } from '../composables/useSpotify';

const { 
  userPlaylists, 
  fetchUserPlaylists, 
  userAlbums, 
  fetchUserAlbums, 
  userArtists, 
  fetchUserArtists,
  searchSpotify,
  searchResults: spotifySearchResults 
} = useSpotify();

const searchQuery = ref('');
const isSearching = ref(false);

// Debounce function
const debounce = (fn, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
};

// Handle search
const handleSearch = debounce(async () => {
  if (searchQuery.value.trim()) {
    isSearching.value = true;
    await searchSpotify(searchQuery.value);
  } else {
    isSearching.value = false;
  }
}, 300);

// Watch for search query changes
watch(searchQuery, handleSearch);

onMounted(async () => {
  await fetchUserPlaylists();
  await fetchUserAlbums();
  await fetchUserArtists();
});
</script>

<template>
  <div class="p-2">
    <div class="bg-[#121212] min-h-[calc(100vh-16px)] rounded-lg p-8">
      <!-- Search Bar -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search in Spotify..."
          class="w-full p-3 rounded-lg bg-[#1e1e1e] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div class="space-y-8">        <!-- Search Results -->
        <template v-if="isSearching && searchQuery">
          <!-- Search Results - Tracks -->
          <div v-if="spotifySearchResults.tracks?.items?.length > 0">
            <h2 class="text-white text-2xl font-bold mb-4">Tracks</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="track in spotifySearchResults.tracks.items"
                :key="track.id"
                class="bg-[#1e1e1e] p-4 rounded-lg cursor-pointer hover:bg-[#282828]"
              >
                <img :src="track.album.images?.[0]?.url" alt="Track Cover" class="w-full h-32 object-cover rounded-md mb-2" />
                <h3 class="text-white text-lg font-semibold">{{ track.name }}</h3>
                <p class="text-gray-400 text-sm">{{ track.artists.map(a => a.name).join(', ') }}</p>
              </div>
            </div>
          </div>

          <!-- Search Results - Albums -->
          <div v-if="spotifySearchResults.albums?.items?.length > 0">
            <h2 class="text-white text-2xl font-bold mb-4">Albums</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="album in spotifySearchResults.albums.items"
                :key="album.id"
                class="bg-[#1e1e1e] p-4 rounded-lg cursor-pointer hover:bg-[#282828]"
              >
                <img :src="album.images?.[0]?.url" alt="Album Cover" class="w-full h-32 object-cover rounded-md mb-2" />
                <h3 class="text-white text-lg font-semibold">{{ album.name }}</h3>
                <p class="text-gray-400 text-sm">{{ album.artists.map(a => a.name).join(', ') }}</p>
              </div>
            </div>
          </div>

          <!-- Search Results - Artists -->
          <div v-if="spotifySearchResults.artists?.items?.length > 0">
            <h2 class="text-white text-2xl font-bold mb-4">Artists</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="artist in spotifySearchResults.artists.items"
                :key="artist.id"
                class="bg-[#1e1e1e] p-4 rounded-lg cursor-pointer hover:bg-[#282828]"
              >
                <img :src="artist.images?.[0]?.url" alt="Artist Image" class="w-full h-32 object-cover rounded-md mb-2" />
                <h3 class="text-white text-lg font-semibold">{{ artist.name }}</h3>
                <p class="text-gray-400 text-sm">{{ artist.genres?.join(', ') || '' }}</p>
              </div>
            </div>
          </div>
        </template>

        <!-- User's Content (shown when not searching) -->
        <template v-else>
          <!-- User's Playlists -->
          <div v-if="userPlaylists?.length > 0">
            <h2 class="text-white text-2xl font-bold mb-4">Your Playlists</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="playlist in userPlaylists"
                :key="playlist.id"
                class="bg-[#1e1e1e] p-4 rounded-lg cursor-pointer hover:bg-[#282828]"
                @click="$emit('open-playlist', playlist)"
              >
                <img :src="playlist.images?.[0]?.url" alt="Playlist Cover" class="w-full h-32 object-cover rounded-md mb-2" />
                <h3 class="text-white text-lg font-semibold">{{ playlist.name }}</h3>
                <p class="text-gray-400 text-sm">{{ playlist.description || '' }}</p>
              </div>
            </div>
          </div>

          <!-- User's Albums -->
          <div v-if="userAlbums?.length > 0">
            <h2 class="text-white text-2xl font-bold mb-4">Your Albums</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="album in userAlbums"
                :key="album.id"
                class="bg-[#1e1e1e] p-4 rounded-lg cursor-pointer hover:bg-[#282828]"
              >
                <img :src="album.album.images?.[0]?.url" alt="Album Cover" class="w-full h-32 object-cover rounded-md mb-2" />
                <h3 class="text-white text-lg font-semibold">{{ album.album.name }}</h3>
                <p class="text-gray-400 text-sm">{{ album.album.artists.map(a => a.name).join(', ') }}</p>
              </div>
            </div>
          </div>

          <!-- User's Artists -->
          <div v-if="userArtists?.length > 0">
            <h2 class="text-white text-2xl font-bold mb-4">Your Top Artists</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="artist in userArtists"
                :key="artist.id"
                class="bg-[#1e1e1e] p-4 rounded-lg cursor-pointer hover:bg-[#282828]"
              >
                <img :src="artist.images?.[0]?.url" alt="Artist Image" class="w-full h-32 object-cover rounded-md mb-2" />
                <h3 class="text-white text-lg font-semibold">{{ artist.name }}</h3>
                <p class="text-gray-400 text-sm">{{ artist.genres?.join(', ') || '' }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
}
</style>