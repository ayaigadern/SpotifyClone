// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
   runtimeConfig: {
    // Private keys: available only on the server
    clientSecret: process.env.CLIENT_SECRET,

    // Public keys: available on both client and server
    public: {
      clientId: process.env.CLIENT_ID,
      redirectUri: process.env.REDIRECT_URI
    },
  },
  compatibilityDate: "2024-11-01",

  devtools: { enabled: false }, // Enable Nuxt devtools for better DX

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['vue', 'vue-router']
    },
    build: {
      target: 'esnext',
      minify: false
    },
    server: {
      hmr: {
        protocol: 'ws',              // Use 'wss' if you're behind HTTPS (e.g., Ngrok)
        host: 'localhost',           // You can try '0.0.0.0' if localhost fails
        port: 24678,                 // Default Vite HMR port
        overlay: true,
        timeout: 30000               // Increase timeout for stability
      },
      watch: {
        usePolling: true,           // Force file change detection (great for WSL, Docker, Ngrok, etc.)
        interval: 100               // Polling interval (ms) for faster reload
      },
      allowedHosts: [
        '6868-196-200-180-29.ngrok-free.app', // Make sure this matches your actual ngrok subdomain
      ],
    },
  },
  

  plugins: [
    { src: '~/plugins/spotify-sdk.client.js', mode: 'client' }
  ],

  app: {
    head: {
      script: [
        {
          src: 'https://sdk.scdn.co/spotify-player.js',
          defer: true
        }
      ]
    }
  },

  watch: [
    '~/components/**',
    '~/layouts/**',
    '~/pages/**',
    '~/composables/**',
    '~/assets/**'
  ],
});
