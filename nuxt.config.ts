// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
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
        '661b-196-200-180-30.ngrok-free.app', // Make sure this matches your actual ngrok subdomain
      ],
    },
  },

  watch: [
    '~/components/**',
    '~/layouts/**',
    '~/pages/**',
    '~/composables/**',
    '~/assets/**'
  ],
});
