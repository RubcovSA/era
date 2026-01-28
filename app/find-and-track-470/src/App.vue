<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import FiltersPanel from './components/FiltersPanel.vue';
import RfpTable from './components/RfpTable.vue';
import { fetchForm470 } from './api/form470';

const STORAGE_KEYS = {
  filters: 'erate_filters',
  watchlist: 'erate_watchlist',
};

const defaultFilters = {
  stateCode: '',
  fundingYear: '',
  serviceCategory: '',
  search: '',
  showSavedOnly: false,
  limit: 200,
};

const filters = ref(loadSavedFilters());
const items = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const watchlist = ref(new Set(loadSavedWatchlist()));

const derivedStats = computed(() => ({
  total: items.value.length,
  saved: watchlist.value.size,
  visible: visibleItems.value.length,
}));

const visibleItems = computed(() => {
  const query = (filters.value.search || '').toLowerCase();
  return items.value
    .filter((item) => {
      if (filters.value.showSavedOnly && !watchlist.value.has(item.id)) return false;
      if (!query) return true;
      const haystack = [
        item.application_number,
        item.billed_entity_name,
        item.billed_entity_city,
        item.billed_entity_state,
        item.service_category,
        item.service_type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => {
      if (a.postedDate && b.postedDate) {
        return b.postedDate - a.postedDate;
      }
      return (b.postedDate ? 1 : 0) - (a.postedDate ? 1 : 0);
    });
});

function loadSavedFilters() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.filters);
    if (saved) {
      return { ...defaultFilters, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Unable to parse saved filters', err);
  }
  return { ...defaultFilters };
}

function loadSavedWatchlist() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.watchlist);
    if (saved) {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.warn('Unable to parse saved watchlist', err);
  }
  return [];
}

watch(
  filters,
  (value) => {
    localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(value));
  },
  { deep: true }
);

watch(
  watchlist,
  (value) => {
    localStorage.setItem(
      STORAGE_KEYS.watchlist,
      JSON.stringify(Array.from(value))
    );
  },
  { deep: true }
);

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const data = await fetchForm470(filters.value);
    items.value = data.map(normalizeRecord);
  } catch (err) {
    console.error(err);
    errorMessage.value =
      'Could not load Form 470 data from USAC. Please try again.';
  } finally {
    loading.value = false;
  }
}

function handleFiltersChange(updatedFilters) {
  filters.value = { ...filters.value, ...updatedFilters };
  loadData();
}

function toggleWatchlist(id) {
  const next = new Set(watchlist.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  watchlist.value = next;
}

function toggleSavedOnly() {
  filters.value = {
    ...filters.value,
    showSavedOnly: !filters.value.showSavedOnly,
  };
}

function normalizeRecord(raw) {
  const postedIso = raw.certified_date_time || raw.rfp_upload_date;
  const dueIso = raw.allowable_contract_date;
  const postedDate = postedIso ? new Date(postedIso) : null;
  const dueDate = dueIso ? new Date(dueIso) : null;
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining =
    dueDate != null ? Math.ceil((dueDate - now) / msPerDay) : null;
  const isNew = postedDate ? (now - postedDate) / msPerDay <= 7 : false;
  const closingSoon =
    daysRemaining != null && daysRemaining <= 10 && daysRemaining >= 0;

  return {
    ...raw,
    id:
      raw.application_number ||
      raw.service_request_id ||
      raw.form_pdf?.url ||
      crypto.randomUUID(),
    postedDate,
    dueDate,
    daysRemaining,
    isNew,
    closingSoon,
    state: raw.billed_entity_state || raw.state_code || raw.state,
  };
}
</script>

<template>
  <div class="page">
    <header class="hero">
      <div>
        <p class="eyebrow">E-Rate • Form 470</p>
        <h1>Find and track new RFPs fast</h1>
        <p class="lede">
          Filter USAC’s open data, scan deadlines, and bookmark the Form 470s
          you care about. Everything stays in your browser.
        </p>
        <div class="meta">
          <span class="pill new">Client-side only</span>
          <span class="pill new">Uses USAC Open Data</span>
          <span class="pill soon">Local watchlist</span>
        </div>
      </div>
      <div class="hero-stats card">
        <div class="stat">
          <div class="stat-label">Visible</div>
          <div class="stat-value">{{ derivedStats.visible }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Total loaded</div>
          <div class="stat-value">{{ derivedStats.total }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Saved</div>
          <div class="stat-value">{{ derivedStats.saved }}</div>
        </div>
      </div>
    </header>

    <FiltersPanel
      :filters="filters"
      :loading="loading"
      @apply="handleFiltersChange"
      @toggle-saved="toggleSavedOnly"
    />

    <RfpTable
      class="card"
      :items="visibleItems"
      :loading="loading"
      :error-message="errorMessage"
      :watchlist="watchlist"
      @refresh="loadData"
      @toggle-watch="toggleWatchlist"
    />
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 20px;
}

.hero h1 {
  margin: 6px 0 10px;
  font-size: 30px;
}

.hero .lede {
  max-width: 640px;
  color: #334155;
  margin: 0 0 10px;
}

.eyebrow {
  font-weight: 600;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  margin: 0;
}

.meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  padding: 10px 14px;
  min-width: 260px;
}

.stat {
  padding: 8px 10px;
  border-left: 1px solid #e2e8f0;
}

.stat:first-child {
  border-left: none;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

@media (max-width: 960px) {
  .hero {
    flex-direction: column;
  }

  .hero-stats {
    width: 100%;
  }
}
</style>
