<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchRfps } from '../api/usac'
import type { RfpFilters, RfpRecord } from '../types/erate'
import RfpFiltersComp from './RfpFilters.vue'
import RfpTable from './RfpTable.vue'
import RfpSummaryChart from './RfpSummaryChart.vue'

const filters = ref<RfpFilters>({
  state: '',
  fundingYear: String(new Date().getFullYear()),
  search: '',
  openOnly: true,
})

const rfps = ref<RfpRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    rfps.value = await fetchRfps(filters.value)
  } catch (e: any) {
    console.error(e)
    error.value =
      'We hit an error talking to USAC Open Data. Check your network or dataset configuration in src/api/usac.ts.'
    rfps.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<template>
  <section class="stack-vertical">
    <div class="card">
      <div class="card-body">
        <div class="stack-horizontal" style="justify-content: space-between; align-items: flex-end;">
          <div>
            <h2 class="app-title" style="font-size: 15px; margin-bottom: 4px;">
              Never miss a good Form 470 again
            </h2>
            <p class="app-subtitle" style="max-width: 520px; font-size: 12px;">
              Pick a territory and funding year, then scan USAC’s Form 470 feed for fresh, high-signal
              opportunities instead of combing through raw exports.
            </p>
          </div>
          <button
            class="button-primary"
            type="button"
            :disabled="loading"
            @click="load"
          >
            <span
              v-if="loading"
              class="spinner-dot"
            />
            <span
              v-else
              class="icon"
            >
              🔍
            </span>
            <span>{{ loading ? 'Scanning RFPs…' : 'Scan RFPs' }}</span>
          </button>
        </div>

        <div style="margin-top: 16px;">
          <RfpFiltersComp
            v-model="filters"
            :loading="loading"
            @submit="load"
          />
        </div>

        <div class="kpi-row" style="margin-top: 10px;">
          <div class="kpi-pill">
            <span class="kpi-label">Records</span>
            <span class="kpi-value">{{ rfps.length }}</span>
          </div>
          <div class="kpi-pill">
            <span class="kpi-label">Coverage cap</span>
            <span class="kpi-value">200 per query</span>
          </div>
        </div>
      </div>
    </div>

    <div class="stack-horizontal--split">
      <div class="card-soft">
        <RfpTable :rfps="rfps" :loading="loading" :error="error" />
      </div>
      <div class="card-soft">
        <RfpSummaryChart :rfps="rfps" />
      </div>
    </div>
  </section>
</template>

