<template>
  <div v-if="isVisible" class="fixed bottom-0 left-0 w-full bg-[#181818] text-white py-2 px-4 flex items-center space-x-4 z-50">
    <div class="flex items-center space-x-4">
      <img 
        :src="currentTrack.album.images[0]?.url" 
        alt="Album Cover" 
        class="w-14 h-14 object-cover rounded-sm"
      />
      <div class="flex flex-col">
        <h3 class="text-sm font-medium">{{ currentTrack.name }}</h3>
        <p class="text-xs text-gray-400">
          {{ currentTrack.artists.map(artist => artist.name).join(', ') }}
        </p>
      </div>
    </div>
    <div class="flex-1 flex justify-center items-center space-x-4">
      <button 
        @click="playPrevious" 
        class="text-gray-400 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 19V5l-7 7"/>
          <path d="M20 19V5l-7 7"/>
        </svg>
      </button>
      <button 
        @click="togglePlay" 
        class="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
      </button>
      <button 
        @click="playNext" 
        class="text-gray-400 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 19V5l7 7"/>
          <path d="M4 19V5l7 7"/>
        </svg>
      </button>
    </div>
    <div class="flex items-center space-x-4">
      <button 
        @click="closePlayer" 
        class="text-gray-400 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <audio 
      ref="audioPlayer" 
      :src="currentTrack.preview_url" 
      @ended="handleTrackEnd"
      class="hidden"
    ></audio>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  currentTrack: {
    type: Object,
    required: false,
    default: null
  }
});

const emit = defineEmits(['next-track', 'previous-track', 'close-player']);

const audioPlayer = ref(null);
const isPlaying = ref(false);
const isVisible = computed(() => !!props.currentTrack);

const togglePlay = () => {
  if (isPlaying.value) {
    audioPlayer.value.pause();
    isPlaying.value = false;
  } else {
    audioPlayer.value.play();
    isPlaying.value = true;
  }
};

const playNext = () => {
  emit('next-track');
};

const playPrevious = () => {
  emit('previous-track');
};

const handleTrackEnd = () => {
  isPlaying.value = false;
  emit('next-track');
};

const closePlayer = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause();
  }
  emit('close-player');
};

watch(() => props.currentTrack, (newTrack) => {
  if (newTrack && newTrack.preview_url) {
    isPlaying.value = true;
    setTimeout(() => {
      audioPlayer.value.play().catch(error => {
        console.error('Error playing audio:', error);
        isPlaying.value = false;
      });
    }, 100);
  }
}, { immediate: true });

onMounted(() => {
  const handleKeyDown = (event) => {
    if (event.code === 'Space' && props.currentTrack) {
      event.preventDefault();
      togglePlay();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
});
</script>

<style scoped>
.fixed {
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
}
</style>