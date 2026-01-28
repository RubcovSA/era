<script setup lang="ts">
import type { RfpRecord } from '../types/erate'

const props = defineProps<{
  rfps: RfpRecord[]
}>()

const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function countsByMonth() {
  const counts = new Array(12).fill(0)
  for (const rfp of props.rfps) {
    const d = new Date(rfp.postingDate)
    if (!Number.isNaN(d.getTime())) {
      counts[d.getMonth()]++
    }
  }
  return counts
}
</script>

<template>
  <div class="card-soft">
    <div class="card-body" style="font-size: 12px;">
    <div class="mb-3 flex items-baseline justify-between">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Posting volume by month
        </p>
        <p class="text-[11px] text-slate-500">
          Quick pulse check of how noisy the current window is.
        </p>
      </div>
      <p class="text-[11px] text-slate-500">
        {{ rfps.length }} RFPs loaded
      </p>
    </div>

    <div class="chart-bars">
      <div
        v-for="(label, idx) in monthLabels"
        :key="label"
        class="chart-bar-outer"
      >
        <div
          class="chart-bar"
          :style="{ height: `${8 + countsByMonth()[idx] * 6}px` }"
        />
        <div class="chart-label">
          {{ label }}
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

