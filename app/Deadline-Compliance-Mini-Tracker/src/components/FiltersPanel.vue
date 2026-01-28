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
        <p class="eyebrow">Filters</p>
        <h2>Focus on the deadlines that matter</h2>
        <p class="sub">
          Pull recent certified filings, then layer urgency, saved items, and text
          search.
        </p>
      </div>
      <div class="buttons">
        <button type="button" class="ghost" :disabled="loading" @click="reset">
          Reset
        </button>
        <button type="button" class="primary" :disabled="loading" @click="submit">
          {{ loading ? 'Loading…' : 'Apply filters' }}
        </button>
      </div>
    </header>

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
      <div class="toggle-row">
        <label class="chip">
          <input
            v-model="localFilters.showSavedOnly"
            type="checkbox"
            :disabled="loading"
            @change="(event) => emit('toggle-saved', event.target.checked)"
          />
          <span>Saved only</span>
        </label>
        <label class="chip">
          <input
            v-model="localFilters.onlyUrgent"
            type="checkbox"
            :disabled="loading"
          />
          <span>Closing soon (≤ 10d)</span>
        </label>
        <label class="chip">
          <input
            v-model="localFilters.onlyNew"
            type="checkbox"
            :disabled="loading"
          />
          <span>New this week</span>
        </label>
        <label class="chip">
          <input
            v-model="localFilters.hasRfpDocs"
            type="checkbox"
            :disabled="loading"
          />
          <span>Has RFP docs</span>
        </label>
        <label class="chip">
          <input
            v-model="localFilters.hasRestrictions"
            type="checkbox"
            :disabled="loading"
          />
          <span>Has restrictions</span>
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  padding: 14px 16px;
  margin-bottom: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
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

.toggle-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f1f5f9;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  cursor: pointer;
}

.chip input {
  accent-color: #2563eb;
  cursor: pointer;
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
