<script setup>
import { ref, computed, onMounted, watch } from 'vue';

import { useSpotify } from '../composables/useSpotify';

onMounted(async ()=>{
    await fetchUserPlaylists();
    await fetchUserAlbums();
    await fetchUserArtists();
    await fetchUserProfile();
});

//filtre
const activeFilter=ref('playlists');
const filteredItems=computed(()=>{
    switch(activeFilter.value){
        case 'playlists':
            console.log("playlist",userPlaylists.value)

      return userPlaylists.value;
        case 'albums':
            console.log("albums",userAlbums.value)
      return userAlbums.value;
      case 'artistes':
        console.log("artists",userArtists.value)
      // Make sure we're returning data in a format that can be displayed properly
      return userArtists.value.map(artist => ({
        id: artist.id,
        name: artist.name,
        images: artist.images || [],
        type: 'artist'
      }));

        default:
      return [];
    }
})
//modal
const searchResults = ref({ tracks: [], albums: [], artists: [] });
const searchQuery = ref('');
const playlistDescription = ref('');
const showPlaylistModal = ref(false);
const playlistName = ref('Nouvelle playlist');
const selectedSongs = ref([]);
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
const searchSongs = debounce(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value.tracks = [];
    return;
  }

  try {
    const data = await searchSpotify(searchQuery.value);
    searchResults.value.tracks = data.tracks.items;
    console.log('Search results:', data.tracks.items);
  } catch (error) {
    console.error('Error searching songs:', error);
    searchResults.value.tracks = [];
  }
}, 300);
const toggleSongSelection = (song) => {
  const index = selectedSongs.value.findIndex((s) => s.id === song.id);
  if (index === -1) {
    selectedSongs.value.push(song);
  } else {
    selectedSongs.value.splice(index, 1);
  }
  console.log('Selected songs:', selectedSongs.value.map((s) => ({ id: s.id, name: s.name, uri: s.uri })));
};
const isPlaylistPublic = ref(false);
const handlePlaylistCreated = async () => {
  try {
    // Validate inputs
    if (!playlistName.value.trim()) {
      throw new Error('Playlist name is required');
    }
    if (playlistName.value.length > 100) {
      throw new Error('Playlist name must be 100 characters or less');
    }
    if (selectedSongs.value.length === 0) {
      throw new Error('At least one song must be selected');
    }

    // Log input data for debugging
    console.log('Creating playlist:', {
      name: playlistName.value,
      description: playlistDescription.value,
      isPublic: isPlaylistPublic.value,
      songCount: selectedSongs.value.length,
      selectedSongs: selectedSongs.value.map((song) => ({
        id: song.id,
        name: song.name,
        uri: song.uri,
      })),
    });

    // Create playlist
    const playlist = await createPlaylist(
      playlistName.value,
      playlistDescription.value,
      isPlaylistPublic.value
    );
    console.log('Playlist created:', { id: playlist.id, name: playlist.name });

    // Add tracks if any
    if (selectedSongs.value.length > 0) {
      const trackUris = selectedSongs.value
        .map((song) => song.uri)
        .filter((uri) => typeof uri === 'string' && uri.startsWith('spotify:track:'));
      console.log('Track URIs to add:', trackUris);

      if (trackUris.length === 0) {
        throw new Error('No valid track URIs found in selected songs');
      }

      await addTracksToPlaylist(playlist.id, trackUris);
      console.log('Tracks added to playlist:', trackUris);
    }

    // Close modal and reset form
    showPlaylistModal.value = false;
    resetPlaylistForm();
    await fetchUserPlaylists();
  } catch (error) {
    console.error('Error creating playlist:', error);
    error.value = error.message || 'Failed to create playlist. Please check your input and try again.';
  }
};
const resetPlaylistForm = () => {
  playlistName.value = 'Nouvelle playlist';
  playlistDescription.value = '';
  isPlaylistPublic.value = false;
  selectedSongs.value = [];
  searchQuery.value = '';
  searchResults.value.tracks = [];
};
const openPlaylistModal = () => {
  showPlaylistModal.value = true;
};

const {
    userPlaylists,
    fetchUserPlaylists,
    userAlbums,
    fetchUserAlbums,
    fetchUserArtists,
    userArtists,
    searchSpotify,
    createPlaylist,
    fetchUserProfile,
    userProfile,
    addTracksToPlaylist
    

}=useSpotify();
</script>

<template>
  <div class="min-h-screen bg-black text-white">
    <div class="fixed left-0 top-0 w-[280px] bg-black p-2 space-y-2">      <div class="bg-[#121212] rounded-lg p-2">
        <div class="space-y-4">
          <a href="#" class="flex items-center space-x-4 px-4 py-2 text-white" @click.prevent="$emit('go-home')">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"
              />
            </svg>
            <span class="text-[15px] font-bold">Accueil</span>
          </a>
          <a
            href="#"
            class="flex items-center space-x-4 px-4 py-2 text-[#B3B3B3] hover:text-white"
          >
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.058l4.353 4.353a1 1 0 1 0 1.414-1.414l-4.344-4.344a9.157 9.157 0 0 0 2.077-5.816c0-5.14-4.226-9.28-9.407-9.28zm-7.407 9.279c0-4.006 3.302-7.28 7.407-7.28s7.407 3.274 7.407 7.28-3.302 7.279-7.407 7.279-7.407-3.273-7.407-7.28z"
              />
            </svg>
            <span class="text-[15px] font-bold">Rechercher</span>
          </a>
        </div>
      </div>
      <!-- Library Section -->
      <div
        class="bg-[#121212] rounded-lg p-2 flex flex-col h-[calc(100vh-88px)]"
      >
        <div class="mt-2 flex flex-col h-full">
          <!-- Library Header -->
          <div
            class="flex items-center justify-between py-2 px-4 text-[#B3B3B3] group"
          >
            <div class="flex items-center space-x-3">
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.464a1 1 0 0 0-.5-.866l-6-3.464zM9 2a1 1 0 0 0-1 1v18a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1z"
                />
              </svg>
              <span class="text-[15px] font-bold">Bibliothèque</span>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="openPlaylistModal"
                class="p-1 hover:text-white opacity-100 group-hover:opacity-100 transition-opacity"
              >
                <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M15.25 8a.75.75 0 01-.75.75H8.75v5.75a.75.75 0 01-1.5 0V8.75H1.5a.75.75 0 010-1.5h5.75V1.5a.75.75 0 011.5 0v5.75h5.75a.75.75 0 01.75.75z"
                  />
                </svg>
              </button>
              <button class="p-1 hover:text-white">
                <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M7.19 1A.749.749 0 0 1 8 .75a.749.749 0 0 1 .81.25l5.5 7.5A.75.75 0 0 1 13.5 10H2.499a.75.75 0 0 1-.81-1.25L7.19 1Z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Filter Pills -->
          <div class="flex flex-wrap gap-2 px-2 py-2">
            <button
              @click="activeFilter = 'playlists'"
              :class="[
                'px-3 py-1 text-[13px] rounded-full font-bold',
                'bg-[#232323] hover:bg-[#2A2A2A]',
                activeFilter === 'playlists' ? 'text-white' : 'text-[#B3B3B3]',
              ]"
            >
              Playlists
            </button>
            <button
              @click="activeFilter = 'albums'"
              :class="[
                'px-3 py-1 text-[13px] rounded-full font-bold',
                'bg-[#232323] hover:bg-[#2A2A2A]',
                activeFilter === 'albums' ? 'text-white' : 'text-[#B3B3B3]',
              ]"
            >
              Albums
            </button>
            <button
              @click="activeFilter = 'artistes'"
              :class="[
                'px-3 py-1 text-[13px] rounded-full font-bold',
                'bg-[#232323] hover:bg-[#2A2A2A]',
                activeFilter === 'artistes' ? 'text-white' : 'text-[#B3B3B3]',
              ]"
            >
              Artistes
            </button>
          </div>

          <!-- Search and Sort -->
          <div class="flex items-center justify-between px-2 py-2">
            <button class="p-1 text-[#B3B3B3] hover:text-white">
              <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M7 1.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zM.25 7a6.75 6.75 0 1 1 12.096 4.12l3.184 3.185a.75.75 0 1 1-1.06 1.06L11.304 12.2A6.75 6.75 0 0 1 .25 7z"
                />
              </svg>
            </button>
            <div class="flex items-center space-x-2 text-[#B3B3B3]">
              <button class="text-[13px] font-bold hover:text-white">
                Récents
              </button>
              <svg class="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M15 3H1v2h14V3zM15 7H1v2h14V7zM15 11H1v2h14v-2z" />
              </svg>
            </div>
          </div>

          <!-- Library Content -->
          <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-2">
            <div class="space-y-2">
              <!-- User's Playlists -->
               <div v-if="activeFilter == 'playlists'">
                   <div
                     v-for="playlist in userPlaylists"
                     :key="playlist.id"
                     class="group flex items-center space-x-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#282828]"
                     @click="$emit('open-playlist', playlist)"
                   >
                     <img :src="playlist.images?.[0]?.url" alt="Playlist Cover" class="w-10 h-10 object-cover rounded-md" />
                     <span class="text-white text-sm font-medium">{{ playlist.name }}</span>
                   </div>
               </div>
               <div v-else>
                   <div
                     v-for="item in filteredItems"
                     :key="item.id"
                     class="group flex items-center space-x-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#282828]"
                   >
                     <img
                       :src="item.images?.[0]?.url || item.album?.images?.[0]?.url"
                       :alt="item.name"
                       class="w-12 h-12 rounded-md object-cover transform transition-transform group-hover:scale-105"
                       onerror="this.src='https://via.placeholder.com/48'"
                     />
                     <div class="flex-1 min-w-0">
                       <div
                         class="text-sm font-bold tracking-wide truncate group-hover:text-white transition-colors"
                       >
                         {{ item.name || item.album.name }}
                       </div>
                       <div class="text-xs text-gray-400 group-hover:text-gray-300">
                         {{
                           activeFilter === "albums"
                             ? "Album"
                             : activeFilter === "artistes"
                             ? "Artiste"
                             : "Playlist"
                         }}
                       </div>
                     </div>
                   </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    
  </div>
  <div
      v-if="showPlaylistModal"
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    >
      <div
        class="bg-[#282828] w-full max-w-3xl rounded-xl shadow-xl max-h-[90vh] overflow-hidden"
      >
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between p-6 border-b border-gray-700"
        >
          <h2 class="text-2xl font-bold">Nouvelle playlist</h2>
          <button
            @click="showPlaylistModal = false"
            class="text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div
          class="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div class="space-y-4">
            <!-- Playlist Info -->
            <input
              v-model="playlistName"
              class="w-full bg-[#3E3E3E] text-white px-3 py-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Nom de la playlist"
            />
            <textarea
              v-model="playlistDescription"
              class="w-full bg-[#3E3E3E] text-white px-3 py-2 rounded h-24 resize-none focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Description facultative"
            ></textarea>
          </div>

          <!-- Song Search and Selection -->
          <div class="space-y-4">
            <div class="relative">
              <input
                v-model="searchQuery"
                @input="searchSongs"
                class="w-full bg-[#3E3E3E] text-white px-3 py-2 rounded focus:ring-2 focus:ring-green-500 focus:outline-none pl-10"
                placeholder="Rechercher des titres"
              />
              <svg
                class="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>

            <!-- Search Results -->
            <div v-if="searchResults.tracks.length > 0" class="space-y-2">
              <div
                v-for="song in searchResults.tracks"
                :key="song.id"
                @click="toggleSongSelection(song)"
                class="flex items-center space-x-3 p-2 hover:bg-[#3E3E3E] rounded-md cursor-pointer"
                :class="{ 'bg-[#3E3E3E]': selectedSongs.some((s) => s.id === song.id) }"
              >
                <img
                  :src="song.album.images[2].url"
                  :alt="song.name"
                  class="w-10 h-10 rounded"
                />
                <div class="flex-1">
                  <div class="text-white">{{ song.name }}</div>
                  <div class="text-sm text-gray-400">
                    {{ song.artists.map((a) => a.name).join(', ') }}
                  </div>
                </div>
                <svg
                  v-if="selectedSongs.some((s) => s.id === song.id)"
                  class="w-5 h-5 text-[#1ED760]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <!-- Selected Songs -->
            <div v-if="selectedSongs.length > 0" class="space-y-2">
              <h3 class="font-bold text-lg">Titres sélectionnés</h3>
              <div
                v-for="song in selectedSongs"
                :key="song.id"
                class="flex items-center space-x-3 p-2 bg-[#3E3E3E] rounded-md"
              >
                <img
                  :src="song.album.images[2].url"
                  :alt="song.name"
                  class="w-10 h-10 rounded"
                />
                <div class="flex-1">
                  <div class="text-white">{{ song.name }}</div>
                  <div class="text-sm text-gray-400">
                    {{ song.artists.map((a) => a.name).join(', ') }}
                  </div>
                </div>
                <button
                  @click="toggleSongSelection(song)"
                  class="text-gray-400 hover:text-white"
                >
                  <svg
                    class="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-500 text-sm p-4">
          {{ error }}
        </div>

        <!-- Modal Footer -->
        <div
          class="flex items-center justify-between px-6 py-4 border-t border-gray-700"
        >
          <div class="flex items-center space-x-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="isPlaylistPublic"
                class="form-checkbox text-green-500 rounded bg-[#3E3E3E] border-none focus:ring-0 focus:ring-offset-0"
              />
              <span>Playlist publique</span>
            </label>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="showPlaylistModal = false"
              class="px-4 py-2 text-sm font-medium text-white hover:text-gray-300"
            >
              Annuler
            </button>
            <button
              @click="handlePlaylistCreated"
              class="px-4 py-2 text-sm font-medium bg-[#1ED760] text-black rounded-full hover:bg-[#1DB954] disabled:opacity-50"
              :disabled="!playlistName || selectedSongs.length === 0"
            >
              Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  
</template>
<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 12px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border: 4px solid transparent;
  border-radius: 20px;
  background-clip: padding-box;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

</style>