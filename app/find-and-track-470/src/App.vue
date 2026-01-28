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

const urgencyStats = computed(() => {
  let closingSoon = 0;
  let newCount = 0;
  let overdue = 0;

  for (const item of visibleItems.value) {
    if (item.closingSoon) closingSoon += 1;
    if (item.isNew) newCount += 1;
    if (item.daysRemaining != null && item.daysRemaining < 0) overdue += 1;
  }

  return { closingSoon, newCount, overdue };
});

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
  <main class="app-shell">
    <div class="page">
      <section class="hero card">
        <div class="hero-content">
          <p class="eyebrow">Idea Incubator • Form 470 workspace</p>
          <h1>Find and track new RFPs fast</h1>
          <p class="lede">
            A calmer, insight-first surface inspired by the Idea Incubator UI.
            Filter USAC data, scan deadlines, and keep a private watchlist
            entirely in your browser.
          </p>

          <div class="meta-row">
            <span class="pill new">Client-side only</span>
            <span class="pill success">Uses USAC Open Data</span>
            <span class="pill soon">Deadline-aware cards</span>
          </div>

          <div class="hero-actions">
            <button class="btn primary" :disabled="loading" @click="loadData">
              {{ loading ? 'Refreshing…' : 'Refresh feed' }}
            </button>
            <button class="btn ghost" @click="toggleSavedOnly">
              {{ filters.showSavedOnly ? 'Show all filings' : 'Show saved only' }}
            </button>
            <span class="hint">Filters persist locally between sessions.</span>
          </div>
        </div>

        <div class="hero-stats">
          <div class="stat-card">
            <div class="stat-label">Visible now</div>
            <div class="stat-value">{{ derivedStats.visible }}</div>
            <div class="stat-sub">After your current filters</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total loaded</div>
            <div class="stat-value">{{ derivedStats.total }}</div>
            <div class="stat-sub">Latest pull from USAC</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Saved list</div>
            <div class="stat-value">{{ derivedStats.saved }}</div>
            <div class="stat-sub">Lives only in your browser</div>
          </div>
          <div class="stat-card accent">
            <div class="stat-label">Closing soon</div>
            <div class="stat-value">{{ urgencyStats.closingSoon }}</div>
            <div class="stat-chip">{{ urgencyStats.newCount }} new this week</div>
          </div>
        </div>
      </section>

      <div class="workspace-grid">
        <FiltersPanel
          class="card filter-card"
          :filters="filters"
          :loading="loading"
          @apply="handleFiltersChange"
          @toggle-saved="toggleSavedOnly"
        />

        <section class="card callout">
          <h3>Stay on top of live filings</h3>
          <p>
            Saved items never leave your device. Use search + state + category to
            keep the visible set tight, then star what matters. Refresh pulls a fresh
            batch directly from USAC Open Data.
          </p>
          <div class="callout-tags">
            <span class="pill success">{{ derivedStats.saved }} saved</span>
            <span class="pill soon">{{ urgencyStats.closingSoon }} closing soon</span>
            <span class="pill new">{{ urgencyStats.newCount }} new this week</span>
          </div>
        </section>
      </div>

      <RfpTable
        class="card table-card"
        :items="visibleItems"
        :loading="loading"
        :error-message="errorMessage"
        :watchlist="watchlist"
        @refresh="loadData"
        @toggle-watch="toggleWatchlist"
      />
    </div>
  </main>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 18px;
  padding: 26px;
  background: radial-gradient(circle at 12% 20%, #eef2ff, transparent 40%),
    radial-gradient(circle at 80% 10%, #e0f2fe, transparent 35%),
    var(--surface);
}

.hero-content h1 {
  margin: 8px 0 12px;
  font-size: 32px;
  letter-spacing: -0.02em;
}

.hero-content .lede {
  max-width: 720px;
  color: var(--muted);
  margin: 0 0 14px;
}

.eyebrow {
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  margin: 0;
}

.meta-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 12px 0;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-actions .hint {
  color: var(--muted);
  font-size: 13px;
}

.hint {
  color: var(--muted);
  font-size: 13px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.stat-card {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff, #f8fafc);
}

.stat-card.accent {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.08), #ffffff);
  border-color: #c7d2fe;
}

.stat-label {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  margin: 0;
}

.stat-sub {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  margin-top: 8px;
  background: #eef2ff;
  color: #312e81;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  margin: 18px 0 12px;
  align-items: start;
}

.callout {
  padding: 18px 20px;
  background: linear-gradient(145deg, #f8fafc, #ffffff);
}

.callout h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.callout p {
  margin: 0;
  color: var(--muted);
}

.callout-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.table-card {
  margin-top: 12px;
}

@media (max-width: 1080px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
