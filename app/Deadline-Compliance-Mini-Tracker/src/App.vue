<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import FiltersPanel from './components/FiltersPanel.vue';
import RfpTable from './components/RfpTable.vue';
import RfpDetails from './components/RfpDetails.vue';
import { fetchForm470 } from './api/form470';

const STORAGE_KEYS = {
  filters: 'deadline_compliance_filters',
  watchlist: 'deadline_compliance_watchlist',
};

const defaultFilters = {
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
};

const filters = ref(loadSavedFilters());
const items = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const lastUpdated = ref(null);
const watchlist = ref(new Set(loadSavedWatchlist()));
const selected = ref(null);
const page = ref(1);
const pageSize = ref(25);

const counts = computed(() => {
  let closingSoon = 0;
  let overdue = 0;
  let newThisWeek = 0;

  for (const item of items.value) {
    if (item.closingSoon) closingSoon += 1;
    if (item.daysRemaining != null && item.daysRemaining < 0) overdue += 1;
    if (item.isNew) newThisWeek += 1;
  }

  return { closingSoon, overdue, newThisWeek };
});

const derivedStats = computed(() => ({
  total: items.value.length,
  saved: watchlist.value.size,
  visible: visibleItems.value.length,
  closingSoon: counts.value.closingSoon,
  overdue: counts.value.overdue,
  newThisWeek: counts.value.newThisWeek,
}));

const visibleItems = computed(() => {
  const query = (filters.value.search || '').toLowerCase();
  return items.value
    .filter((item) => {
      if (filters.value.showSavedOnly && !watchlist.value.has(item.id)) return false;
      if (filters.value.onlyUrgent) {
        if (!(item.daysRemaining != null && item.daysRemaining <= 10 && item.daysRemaining >= 0)) {
          return false;
        }
      }
      if (filters.value.onlyNew && !item.isNew) return false;
      if (filters.value.hasRfpDocs && !item.hasRfpDocs) return false;
      if (filters.value.hasRestrictions && !item.hasRestrictions) return false;
      if (filters.value.applicantType && item.applicant_type !== filters.value.applicantType)
        return false;
      if (filters.value.serviceType && item.service_type !== filters.value.serviceType)
        return false;
      if (filters.value.minEntities) {
        const min = Number(filters.value.minEntities);
        if (!Number.isNaN(min) && (item.entitiesNum ?? 0) < min) return false;
      }
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

const pageCount = computed(() =>
  Math.max(1, Math.ceil(visibleItems.value.length / pageSize.value || 1))
);

const pagedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return visibleItems.value.slice(start, start + pageSize.value);
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
    lastUpdated.value = new Date();
  } catch (err) {
    console.error(err);
    errorMessage.value =
      'Could not load Form 470 data from USAC. Please try again.';
  } finally {
    loading.value = false;
  }
}

function handleFiltersChange(updatedFilters) {
  const next = { ...filters.value, ...updatedFilters };
  const apiKeys = [
    'stateCode',
    'fundingYear',
    'serviceCategory',
    'serviceType',
    'applicantType',
    'windowDays',
    'limit',
    'hasRfpDocs',
    'hasRestrictions',
  ];
  const needsApi = apiKeys.some((key) => next[key] !== filters.value[key]);
  filters.value = next;
  page.value = 1;
  if (needsApi) {
    loadData();
  }
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

function toggleSavedOnly(nextValue) {
  filters.value = {
    ...filters.value,
    showSavedOnly: nextValue,
  };
}

function handleSelect(item) {
  selected.value = item;
}

function handlePageChange(newPage) {
  page.value = Math.min(Math.max(newPage, 1), pageCount.value);
}

function handlePageSizeChange(newSize) {
  pageSize.value = newSize;
  page.value = 1;
}

function formatTimestamp(date) {
  if (!date) return '—';
  return date.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
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
    hasRfpDocs: Boolean(raw.rfp_documents?.url || raw.service_request_rfp_attachment),
    hasRestrictions: raw.state_or_local_restrictions === true,
    entitiesNum: parseInt(raw.entities, 10) || null,
    minCapacity: raw.minimum_capacity ? Number(raw.minimum_capacity) : null,
    maxCapacity: raw.maximum_capacity ? Number(raw.maximum_capacity) : null,
    state: raw.billed_entity_state || raw.state_code || raw.state,
  };
}
</script>

<template>
  <div class="page">
    <header class="hero card">
      <div class="hero-content">
        <p class="eyebrow">E-Rate • Deadline compliance</p>
        <h1>Stay inside the 28-day window</h1>
        <p class="lede">
          Browser-only Vue app that pulls USAC open data, flags closing windows,
          and lets you keep a local watchlist.
        </p>
        <div class="meta">
          <span class="pill new">Client-side only</span>
          <span class="pill new">USAC Open Data</span>
          <span class="pill soon">Local storage</span>
        </div>
        <p class="updated">Last refreshed: {{ formatTimestamp(lastUpdated) }}</p>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <p class="stat-label">Visible now</p>
          <p class="stat-value">{{ derivedStats.visible }}</p>
          <p class="stat-sub">After filters</p>
        </div>
        <div class="stat">
          <p class="stat-label">Closing ≤ 10d</p>
          <p class="stat-value">{{ derivedStats.closingSoon }}</p>
          <p class="stat-sub">Urgent</p>
        </div>
        <div class="stat">
          <p class="stat-label">Past due</p>
          <p class="stat-value warn">{{ derivedStats.overdue }}</p>
          <p class="stat-sub">Missed windows</p>
        </div>
        <div class="stat">
          <p class="stat-label">New this week</p>
          <p class="stat-value">{{ derivedStats.newThisWeek }}</p>
          <p class="stat-sub">Fresh filings</p>
        </div>
        <div class="stat">
          <p class="stat-label">Saved locally</p>
          <p class="stat-value">{{ derivedStats.saved }}</p>
          <p class="stat-sub">Watchlist</p>
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
      :items="pagedItems"
      :loading="loading"
      :error-message="errorMessage"
      :watchlist="watchlist"
      :selected-id="selected?.id"
      :page="page"
      :page-count="pageCount"
      :page-size="pageSize"
      :total="derivedStats.visible"
      @refresh="loadData"
      @toggle-watch="toggleWatchlist"
      @select="handleSelect"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    />

    <RfpDetails v-if="selected" class="card detail-card" :item="selected" />
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  padding: 20px;
  margin-bottom: 20px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero h1 {
  margin: 6px 0 2px;
  font-size: 30px;
}

.hero .lede {
  max-width: 680px;
  color: #334155;
  margin: 0 0 6px;
}

.updated {
  color: #475569;
  font-size: 13px;
  margin: 6px 0 0;
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
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.stat {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  margin: 2px 0;
}

.stat-value.warn {
  color: #b91c1c;
}

.stat-sub {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    width: 100%;
  }
}

.detail-card {
  margin-top: 16px;
  padding: 16px;
}
</style>
