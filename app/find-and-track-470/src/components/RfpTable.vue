<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  watchlist: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['refresh', 'toggle-watch']);

const hasResults = computed(() => props.items.length > 0);

const summary = computed(() => {
  const closingSoon = props.items.filter((item) => item.closingSoon).length;
  const newCount = props.items.filter((item) => item.isNew).length;
  return { closingSoon, newCount };
});

function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDays(days) {
  if (days == null) return '—';
  return days === 0 ? 'Due today' : `${days}d`;
}
</script>

<template>
  <section class="table-wrap">
    <header class="table-header">
      <div>
        <p class="eyebrow">Results</p>
        <h2>Live Form 470 filings</h2>
        <p class="sub">
          {{ loading ? 'Fetching latest filings...' : 'Showing recent Form 470 filings' }}
        </p>
      </div>

      <div class="actions">
        <div class="chips">
          <span class="pill new">{{ summary.newCount }} new</span>
          <span class="pill soon">{{ summary.closingSoon }} closing soon</span>
          <span class="pill success">{{ watchlist.size }} saved</span>
        </div>
        <button class="btn ghost" :disabled="loading" @click="emit('refresh')">
          Refresh
        </button>
      </div>
    </header>

    <div v-if="loading" class="panel-state loading">
      <div class="spinner" aria-label="Loading" />
      <div>
        <p class="state-title">Loading Form 470 data…</p>
        <p class="hint">Pulling directly from USAC Open Data</p>
      </div>
    </div>

    <div v-else-if="errorMessage" class="panel-state error">
      <div>
        <p class="state-title">Could not load Form 470 data.</p>
        <p class="hint">{{ errorMessage }}</p>
      </div>
      <button class="btn primary" @click="emit('refresh')">Try again</button>
    </div>

    <div v-else-if="!hasResults" class="panel-state empty">
      <div>
        <p class="state-title">No Form 470 filings match your filters.</p>
        <p class="hint">Try a different state, year, or clear the search.</p>
      </div>
    </div>

    <div v-else class="table-scroller">
      <table>
        <thead>
          <tr>
            <th>Save</th>
            <th>Filing</th>
            <th>Applicant</th>
            <th>Service</th>
            <th>Timeline</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in props.items" :key="item.id">
            <td>
              <button
                class="icon-btn"
                :aria-pressed="watchlist.has(item.id)"
                :title="watchlist.has(item.id) ? 'Remove from saved' : 'Save this Form 470'"
                @click="emit('toggle-watch', item.id)"
              >
                <span v-if="watchlist.has(item.id)">★</span>
                <span v-else>☆</span>
              </button>
            </td>
            <td class="filing">
              <div class="strong">
                <a
                  v-if="item.form_pdf?.url"
                  :href="item.form_pdf.url"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ item.application_number || '—' }}
                </a>
                <span v-else>{{ item.application_number || '—' }}</span>
              </div>
              <div class="badges">
                <span v-if="item.isNew" class="pill new">New</span>
                <span v-if="item.closingSoon" class="pill soon">Closing soon</span>
                <span
                  v-if="item.daysRemaining != null && item.daysRemaining < 0"
                  class="pill warn"
                >
                  Past due
                </span>
              </div>
            </td>
            <td>
              <div class="primary-text">{{ item.billed_entity_name || '—' }}</div>
              <div class="muted">
                {{ item.billed_entity_city || '—' }},
                {{ item.state || '—' }}
              </div>
            </td>
            <td>
              <div class="primary-text">{{ item.service_category || '—' }}</div>
              <div class="muted">{{ item.service_type || item.function || '—' }}</div>
            </td>
            <td class="timeline">
              <div class="dates">
                <span class="label">Posted</span>
                <span>{{ formatDate(item.postedDate || item.certified_date_time) }}</span>
              </div>
              <div class="dates">
                <span class="label">Due</span>
                <span>{{ formatDate(item.dueDate || item.allowable_contract_date) }}</span>
              </div>
              <div
                class="pill timeline-pill"
                :class="{
                  soon: item.closingSoon,
                  warn: item.daysRemaining != null && item.daysRemaining < 0,
                }"
              >
                {{ formatDays(item.daysRemaining) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.table-wrap {
  padding: 14px;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.table-header h2 {
  margin: 0;
}

.table-header .sub {
  margin-top: 4px;
}

.sub {
  margin: 2px 0 0;
  color: var(--muted);
}

.actions button {
  padding: 10px 12px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.table-scroller {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff, #f8fafc);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 1;
  font-size: 13px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

tbody tr:hover {
  background: #f8fafc;
}

.panel-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px dashed var(--border);
  border-radius: 12px;
  background: var(--surface-muted);
}

.icon-btn {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  width: 38px;
  height: 38px;
  background: #fff;
  cursor: pointer;
  font-size: 18px;
  transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease;
}

.icon-btn[aria-pressed='true'] {
  color: #f59e0b;
  border-color: #fcd34d;
  background: #fffbeb;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.15);
}

.strong {
  font-weight: 700;
}

.primary-text {
  font-weight: 600;
  color: #0f172a;
}

.muted {
  color: #64748b;
  font-size: 13px;
}

.filing .badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.timeline {
  min-width: 200px;
}

.dates {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--text);
  gap: 10px;
}

.dates .label {
  color: var(--muted);
  font-weight: 600;
}

.timeline-pill {
  margin-top: 8px;
}

.state-title {
  margin: 0 0 4px;
  font-weight: 700;
}

.hint {
  color: var(--muted);
  margin: 0;
}
</style>
