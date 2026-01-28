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
  applicantType: '',
  serviceType: '',
  hasRfpDocs: false,
  hasRestrictions: false,
  minEntities: '',
  windowDays: 120,
  onlyUrgent: false,
  onlyNew: false,
  showSavedOnly: false,
  limit: 250,
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

const serviceTypeOptions = [
  'Data Transmission and/or Internet Access',
  'Internet Access and/or Telecommunications',
  'Internal Connections',
  'Managed Internal Broadband Services',
  'Basic Maintenance of Internal Connections',
  'Miscellaneous',
];

const applicantTypeOptions = [
  'School District',
  'School',
  'Library',
  'Library System',
  'Consortium',
  'Education Service Agency',
  'State Agency',
];

const windowOptions = [
  { label: '30 days', value: 30 },
  { label: '60 days', value: 60 },
  { label: '120 days', value: 120 },
  { label: '180 days', value: 180 },
  { label: '1 year', value: 365 },
];

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
    <header class="panel-header">
      <div>
        <p class="eyebrow">Filter runway</p>
        <h2>Slice the Form 470 feed</h2>
        <p class="sub">
          Blend geography, categories, docs, and urgency to narrow the radar.
        </p>
      </div>
      <div class="buttons">
        <button type="button" class="btn ghost" :disabled="loading" @click="reset">
          Reset
        </button>
        <button type="button" class="btn primary" :disabled="loading" @click="submit">
          {{ loading ? 'Loading…' : 'Apply filters' }}
        </button>
      </div>
    </header>

    <div class="chip-row">
      <label class="chip toggle">
        <input
          v-model="localFilters.showSavedOnly"
          type="checkbox"
          :disabled="loading"
          @change="(event) => emit('toggle-saved', event.target.checked)"
        />
        <span>Saved only</span>
      </label>
      <label class="chip toggle">
        <input
          v-model="localFilters.onlyUrgent"
          type="checkbox"
          :disabled="loading"
        />
        <span>Closing soon (≤ 10d)</span>
      </label>
      <label class="chip toggle">
        <input
          v-model="localFilters.onlyNew"
          type="checkbox"
          :disabled="loading"
        />
        <span>New this week</span>
      </label>
      <label class="chip toggle">
        <input
          v-model="localFilters.hasRfpDocs"
          type="checkbox"
          :disabled="loading"
        />
        <span>Has RFP docs</span>
      </label>
      <label class="chip toggle">
        <input
          v-model="localFilters.hasRestrictions"
          type="checkbox"
          :disabled="loading"
        />
        <span>Has restrictions</span>
      </label>
    </div>

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

      <div class="field">
        <label for="window">Window</label>
        <select
          id="window"
          v-model.number="localFilters.windowDays"
          :disabled="loading"
        >
          <option v-for="opt in windowOptions" :key="opt.value" :value="opt.value">
            Last {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="panel-row secondary">
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
      <div class="field">
        <label for="applicantType">Applicant type</label>
        <select
          id="applicantType"
          v-model="localFilters.applicantType"
          :disabled="loading"
        >
          <option value="">All</option>
          <option v-for="opt in applicantTypeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
      <div class="field">
        <label for="serviceType">Service type</label>
        <select
          id="serviceType"
          v-model="localFilters.serviceType"
          :disabled="loading"
        >
          <option value="">All</option>
          <option v-for="opt in serviceTypeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
      </div>
      <div class="field">
        <label for="minEntities">Min entities</label>
        <input
          id="minEntities"
          v-model="localFilters.minEntities"
          type="number"
          min="0"
          :disabled="loading"
          placeholder="e.g. 10"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.panel-header h2 {
  margin: 4px 0 4px;
}

.panel-header .sub {
  margin: 0;
  color: #475569;
}

.panel-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.panel-row.secondary {
  align-items: center;
  margin-top: 10px;
}

.chip-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
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
  transition: border-color 120ms ease, box-shadow 120ms ease;
}

input:disabled,
select:disabled {
  opacity: 0.7;
  background: #f8fafc;
}

input:focus,
select:focus {
  border-color: #6366f1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
}

.search input {
  width: 100%;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  cursor: pointer;
}

.chip.toggle {
  background: #eef2ff;
  border-color: #dfe3ff;
}

.chip input {
  accent-color: #2563eb;
  cursor: pointer;
}

.buttons {
  display: flex;
  gap: 10px;
}
</style>
