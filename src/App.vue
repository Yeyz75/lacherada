<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import Navbar from './components/NavBar/index.vue'
  import Footer from './components/Footer/index.vue'
  import { useTheme } from './composables/useTheme'

  const { initTheme } = useTheme()

  onMounted(() => {
    initTheme()
  })
</script>

<style>
  @import url('./styles/globals.css');

  #app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
  }
</style>
