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
import HeroSection from '../../components/HeroSections/index.vue'
import HowItWorks from '../../components/HowItWorks/index.vue'
import Categories from '../../components/Categories/index.vue'
import Testimonials from '../../components/Testimonials/index.vue'
import StatsSection from '../../components/StatsSection/index.vue'
</script>

<style scoped>
.home {
  min-height: 100vh;
}
</style>
