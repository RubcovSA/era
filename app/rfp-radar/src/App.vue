<script setup lang="ts">
import RfpRadar from './components/RfpRadar.vue'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header-inner">
        <div>
          <h1 class="app-title">
            RFP Radar
          </h1>
          <p class="app-subtitle">
            FCC Form 470 opportunity scanner for E-rate service providers
          </p>
        </div>
        <span class="app-pill">
          Prototype · 1-day build
        </span>
      </div>
    </header>

    <main class="app-main">
      <RfpRadar />
    </main>
  </div>
</template>

