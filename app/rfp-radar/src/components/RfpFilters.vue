<script setup lang="ts">
import type { RfpFilters as FiltersModel } from '../types/erate'
const stateOptions = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const currentYear = new Date().getFullYear()
const fyOptions = [
  String(currentYear - 1),
  String(currentYear),
  String(currentYear + 1),
]

const props = defineProps<{
  modelValue: FiltersModel
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FiltersModel]
  submit: []
}>()

function update<K extends keyof FiltersModel>(key: K, value: FiltersModel[K]) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}

function handleEnter() {
  emit('submit')
}
</script>

<template>
  <div class="filters-grid">
    <div>
      <label class="field-label">State</label>
      <select
        class="field-select"
        :value="modelValue.state"
        @change="update('state', ($event.target as HTMLSelectElement).value)"
        @keyup.enter="handleEnter"
      >
        <option value="">All states</option>
        <option v-for="state in stateOptions" :key="state" :value="state">
          {{ state }}
        </option>
      </select>
    </div>

    <div>
      <label class="field-label">Funding year</label>
      <select
        class="field-select"
        :value="modelValue.fundingYear"
        @change="update('fundingYear', ($event.target as HTMLSelectElement).value)"
        @keyup.enter="handleEnter"
      >
        <option v-for="fy in fyOptions" :key="fy" :value="fy">
          FY {{ fy }}
        </option>
      </select>
    </div>

    <div>
      <label class="field-label">Search (district or narrative)</label>
      <input
        class="field-input"
        type="text"
        :value="modelValue.search"
        placeholder="e.g. Cisco, dark fiber, Houston…"
        @input="update('search', ($event.target as HTMLInputElement).value)"
        @keyup.enter="handleEnter"
      />
    </div>

    <div>
      <label class="field-label">&nbsp;</label>
      <div class="checkbox-row">
        <input
          class="checkbox-input"
          type="checkbox"
          :checked="modelValue.openOnly"
          @change="update('openOnly', ($event.target as HTMLInputElement).checked)"
        />
        <span>Only currently open RFPs</span>
      </div>
      <p class="field-helper">
        Filters apply when you hit “Scan RFPs” so you can stage a territory first.
      </p>
    </div>
  </div>
</template>

