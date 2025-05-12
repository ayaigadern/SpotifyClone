<template>
  <div v-if="currentTrack" class="fixed bottom-0 left-0 w-full bg-[#121212] text-white p-4 flex items-center space-x-4">
    <img :src="currentTrack.album.images[0]?.url" alt="Album Cover" class="w-16 h-16 object-cover rounded-md" />
    <div class="flex-1">
      <h3 class="text-lg font-semibold">{{ currentTrack.name }}</h3>
      <p class="text-sm text-gray-400">{{ currentTrack.artists.map(artist => artist.name).join(', ') }}</p>
    </div>
    <audio ref="audioPlayer" :src="currentTrack.preview_url" controls autoplay class="w-1/3"></audio>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  currentTrack: {
    type: Object,
    required: false,
  },
});

const audioPlayer = ref(null);
</script>

<style scoped>
.fixed {
  z-index: 50;
}
</style>