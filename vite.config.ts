import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
      scale: 1,
      defaultStyle: '',
      defaultClass: '',
      customCollections: {
        // Opción para iconos personalizados si los necesitas
        custom: FileSystemIconLoader('./src/assets/icons'),
      },
    }),
  ],
  optimizeDeps: {
    include: ['@iconify/json/json/lucide.json', '@iconify/json/json/mdi.json'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router'],
          primevue: ['primevue'],
        },
      },
    },
  },
})
