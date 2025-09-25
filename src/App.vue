<template>
  <div id="app">
    <div v-if="!authReady" class="app-loading">
      <ProgressSpinner stroke-width="4" />
    </div>
    <template v-else>
      <Navbar />
      <main class="main-content">
        <router-view />
      </main>
      <Footer />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Navbar from './components/NavBar/index.vue'
import Footer from './components/Footer/index.vue'
import { useTheme } from './composables/useTheme'
import { useAuth } from './composables/useAuth'
import ProgressSpinner from 'primevue/progressspinner'

const { initTheme } = useTheme()
const { initialized, initialize } = useAuth()
const authReady = computed(() => initialized.value)

onMounted(() => {
  initTheme()
  initialize().catch((err) => {
    console.error('Auth initialization failed in App', err)
  })
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

.app-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
