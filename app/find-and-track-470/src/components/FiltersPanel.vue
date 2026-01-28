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
    <header class="panel-head">
      <div>
        <p class="eyebrow">Filters</p>
        <h3>Shape the feed</h3>
        <p class="hint">
          Combine state, funding year, and service category to shrink results. Keywords match
          applicant, city, and service notes.
        </p>
      </div>
      <span class="pill">Local &amp; fast</span>
    </header>

    <div class="panel-grid">
      <div class="field">
        <label for="state">State</label>
        <span class="field-help">Focus on a territory</span>
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
        <span class="field-help">Current, next, or last</span>
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
        <span class="field-help">USAC service grouping</span>
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
    </div>

    <div class="panel-grid single">
      <div class="field search">
        <label for="search">Search text</label>
        <span class="field-help">Applicant, city, service, or application #</span>
        <input
          id="search"
          v-model="localFilters.search"
          :disabled="loading"
          type="search"
          placeholder="Lakeview Public Schools, fiber, AP managed..."
        />
      </div>
    </div>

    <div class="panel-footer">
      <label class="switch">
        <input
          id="savedOnly"
          v-model="localFilters.showSavedOnly"
          type="checkbox"
          :disabled="loading"
          @change="() => emit('toggle-saved')"
        />
        <span class="switch-control" aria-hidden="true" />
        <span class="switch-label">Show saved only</span>
      </label>

      <div class="buttons">
        <button type="button" class="btn ghost" :disabled="loading" @click="reset">
          Reset
        </button>
        <button type="button" class="btn primary" :disabled="loading" @click="submit">
          {{ loading ? 'Loading…' : 'Apply filters' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  padding: 18px 18px 14px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.panel-head h3 {
  margin: 6px 0 6px;
  font-size: 20px;
}

.panel-head .hint {
  margin: 0;
}

.hint {
  color: var(--muted);
  font-size: 13px;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.panel-grid.single {
  grid-template-columns: 1fr;
  margin-top: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-help {
  font-size: 12px;
  color: var(--muted);
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 700;
  color: var(--text);
}

.switch input {
  display: none;
}

.switch-control {
  width: 46px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #e2e8f0;
  position: relative;
  transition: background 140ms ease, border-color 140ms ease;
}

.switch-control::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: transform 140ms ease;
}

.switch input:checked + .switch-control {
  background: linear-gradient(135deg, var(--primary), #6366f1);
  border-color: transparent;
}

.switch input:checked + .switch-control::after {
  transform: translateX(18px);
}

.switch-label {
  font-weight: 700;
}

.buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search input {
  width: 100%;
}
</style>
