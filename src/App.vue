<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <Home />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Navbar from './components/navbar/index.vue'
import Footer from './components/footer/index.vue'
import Home from './views/home/index.vue'
import { useTheme } from './composables/useTheme'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<style>
@import './styles/globals.css';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>