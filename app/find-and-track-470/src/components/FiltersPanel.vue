<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['apply', 'toggle-saved']);

const baseFilters = computed(() => ({
  stateCode: '',
  fundingYear: '',
  serviceCategory: '',
  search: '',
  showSavedOnly: false,
  limit: 200,
  ...props.filters,
}));

const localFilters = ref({ ...baseFilters.value });

watch(
  () => props.filters,
  (next) => {
    localFilters.value = { ...baseFilters.value, ...next };
  },
  { deep: true }
);

function submit() {
  emit('apply', { ...localFilters.value });
}

function reset() {
  localFilters.value = { ...baseFilters.value };
  emit('apply', { ...localFilters.value });
}

const currentYear = new Date().getFullYear();
const fundingYearOptions = [currentYear, currentYear + 1, currentYear - 1].map(
  String
);

const serviceCategoryOptions = ['Category 1', 'Category 2'];

const stateOptions = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'DC',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY',
];
</script>

<template>
  <section class="card panel">
    <div class="panel-row">
      <div class="field">
        <label for="state">State</label>
        <select
          id="state"
          v-model="localFilters.stateCode"
          :disabled="loading"
        >
          <option value="">All</option>
          <option v-for="state in stateOptions" :key="state" :value="state">
            {{ state }}
          </option>
        </select>
      </div>

      <div class="field">
        <label for="fundingYear">Funding year</label>
        <select
          id="fundingYear"
          v-model="localFilters.fundingYear"
          :disabled="loading"
        >
          <option value="">All</option>
          <option
            v-for="year in fundingYearOptions"
            :key="year"
            :value="year"
          >
            {{ year }}
          </option>
        </select>
      </div>

      <div class="field">
        <label for="category">Category</label>
        <select
          id="category"
          v-model="localFilters.serviceCategory"
          :disabled="loading"
        >
          <option value="">All</option>
          <option
            v-for="cat in serviceCategoryOptions"
            :key="cat"
            :value="cat"
          >
            {{ cat }}
          </option>
        </select>
      </div>

      <div class="field search">
        <label for="search">Search text</label>
        <input
          id="search"
          v-model="localFilters.search"
          :disabled="loading"
          type="search"
          placeholder="Applicant, city, service, application #"
        />
      </div>
    </div>

    <div class="panel-row controls">
      <div class="toggle">
        <input
          id="savedOnly"
          v-model="localFilters.showSavedOnly"
          type="checkbox"
          :disabled="loading"
          @change="() => emit('toggle-saved')"
        />
        <label for="savedOnly">Show saved only</label>
      </div>

      <div class="buttons">
        <button type="button" class="ghost" :disabled="loading" @click="reset">
          Reset
        </button>
        <button type="button" class="primary" :disabled="loading" @click="submit">
          {{ loading ? 'Loading…' : 'Apply filters' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  padding: 14px 16px;
  margin-bottom: 16px;
}

.panel-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.panel-row.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  flex-wrap: wrap;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 600;
  color: #0f172a;
  font-size: 14px;
}

input,
select {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
}

input:disabled,
select:disabled {
  opacity: 0.7;
  background: #f8fafc;
}

.search input {
  width: 100%;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.buttons {
  display: flex;
  gap: 10px;
}

button {
  border-radius: 8px;
  padding: 10px 14px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 700;
}

button.ghost {
  background: #fff;
  border-color: #e2e8f0;
  color: #0f172a;
}

button.primary {
  background: #2563eb;
  color: #fff;
  border-color: #1d4ed8;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
