<template>
  <div class="home">
    <HeroSection />
    <HowItWorks />
    <Categories />
    <Testimonials />
    <StatsSection />
  </div>
</template>

<script setup lang="ts">
import HeroSection from '../../components/hero-section/index.vue'
import HowItWorks from '../../components/how-it-works/index.vue'
import Categories from '../../components/categories/index.vue'
import Testimonials from '../../components/testimonials/index.vue'
import StatsSection from '../../components/stats-section/index.vue'
</script>

<style scoped>
.home {
  min-height: 100vh;
}
</style>