<script setup>
import { ref } from 'vue';
import Home from '../components/home.vue';
import Sidebar from '../components/sidebar.vue';
import PlaylistDetails from '../components/playlistDetails.vue';

const selectedPlaylist = ref(null);

const openPlaylistDetails = (playlist) => {
  console.log('Selected Playlist:', playlist); // Debugging log
  selectedPlaylist.value = playlist;
};

const goHome = () => {
  selectedPlaylist.value = null;
};
</script>

<template>
  <div class="flex min-h-screen bg-black">
    <Sidebar @open-playlist="openPlaylistDetails" @go-home="goHome" />
    <div class="flex-1 ml-[280px]"> <!-- Added margin-left to match sidebar width -->
      <div v-if="selectedPlaylist">
        <PlaylistDetails :playlist="selectedPlaylist" />
      </div>
      <div v-else>
        <Home @open-playlist="openPlaylistDetails" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
  width: calc(100% - 280px); /* Ensures content takes full remaining width */
}
</style>