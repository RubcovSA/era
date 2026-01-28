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

const heroStats = computed(() => [
  { label: 'Visible now', value: derivedStats.value.visible, hint: 'After filters', tone: 'primary' },
  { label: 'Closing ≤ 10d', value: derivedStats.value.closingSoon, hint: 'High urgency', tone: 'warn' },
  { label: 'Past due', value: derivedStats.value.overdue, hint: 'Missed 28-day window', tone: 'danger' },
  { label: 'New this week', value: derivedStats.value.newThisWeek, hint: 'Fresh filings', tone: 'accent' },
  { label: 'Saved locally', value: derivedStats.value.saved, hint: 'Your watchlist', tone: 'success' },
]);

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
    <section class="hero card">
      <div class="hero-main">
        <div class="hero-tags">
          <span class="pill soft">E-Rate</span>
          <span class="pill primary">Form 470</span>
          <span class="pill success">Local watchlist</span>
        </div>
        <h1>Deadline compliance cockpit</h1>
        <p class="lede">
          Monitor competitive bidding windows, spot late filings, and keep a private shortlist before the 28-day clock runs out.
        </p>
        <div class="hero-actions">
          <div class="hero-buttons">
            <button type="button" class="btn primary" :disabled="loading" @click="loadData">
              {{ loading ? 'Refreshing…' : 'Refresh feed' }}
            </button>
            <button
              type="button"
              class="btn ghost"
              :aria-pressed="filters.showSavedOnly"
              @click="toggleSavedOnly(!filters.showSavedOnly)"
            >
              {{ filters.showSavedOnly ? 'Show everything' : 'Saved only' }}
            </button>
          </div>
          <p class="muted updated">Updated {{ formatTimestamp(lastUpdated) }}</p>
        </div>
      </div>
      <div class="hero-stats">
        <div
          v-for="stat in heroStats"
          :key="stat.label"
          class="stat-card"
          :class="stat.tone"
        >
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-sub">{{ stat.hint }}</p>
        </div>
      </div>
    </section>

    <section class="pulse card">
      <div class="pulse-item warn">
        <div class="pill warn">Closing soon</div>
        <p class="pulse-value">{{ counts.closingSoon }}</p>
        <p class="pulse-label">Due within 10 days</p>
      </div>
      <div class="pulse-item danger">
        <div class="pill danger">Past due</div>
        <p class="pulse-value">{{ counts.overdue }}</p>
        <p class="pulse-label">Needs follow-up</p>
      </div>
      <div class="pulse-item accent">
        <div class="pill primary">Lookback window</div>
        <p class="pulse-value">{{ filters.windowDays }}d</p>
        <p class="pulse-label">Using USAC Form 470 dataset</p>
      </div>
      <div class="pulse-item success">
        <div class="pill success">New this week</div>
        <p class="pulse-value">{{ counts.newThisWeek }}</p>
        <p class="pulse-label">Fresh filings to review</p>
      </div>
    </section>

    <div class="content-grid">
      <FiltersPanel
        :filters="filters"
        :loading="loading"
        @apply="handleFiltersChange"
        @toggle-saved="toggleSavedOnly"
      />

      <div class="main-stack">
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
    </div>
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 18px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(37, 99, 235, 0.08)),
    var(--surface);
  border: 1px solid rgba(99, 102, 241, 0.14);
}

.hero-main h1 {
  margin: 8px 0 4px;
  font-size: 32px;
}

.hero-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.updated {
  margin: 0;
  font-size: 13px;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.stat-card {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  background: var(--surface);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.stat-card .stat-label {
  font-size: 12px;
  color: #475569;
  margin: 0;
}

.stat-card .stat-value {
  margin: 2px 0;
  font-size: 28px;
  font-weight: 800;
}

.stat-card .stat-sub {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.stat-card.warn .stat-value {
  color: #b45309;
}

.stat-card.danger .stat-value {
  color: #b91c1c;
}

.stat-card.accent .stat-value {
  color: #2563eb;
}

.stat-card.success .stat-value {
  color: #15803d;
}

.pulse {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  padding: 14px;
}

.pulse-item {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  background: var(--surface-muted);
}

.pulse-item.warn {
  background: #fff4e5;
  border-color: #fed7aa;
}

.pulse-item.danger {
  background: #ffe4e6;
  border-color: #fecdd3;
}

.pulse-item.accent {
  background: #eef2ff;
  border-color: #e0e7ff;
}

.pulse-item.success {
  background: #ecfdf3;
  border-color: #bbf7d0;
}

.pulse-value {
  margin: 4px 0;
  font-size: 30px;
  font-weight: 800;
}

.pulse-label {
  margin: 0;
  color: #475569;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
}

.main-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-card {
  padding: 16px;
}

@media (min-width: 1040px) {
  .content-grid {
    grid-template-columns: 380px 1fr;
  }
}

@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    width: 100%;
  }
}
</style>
