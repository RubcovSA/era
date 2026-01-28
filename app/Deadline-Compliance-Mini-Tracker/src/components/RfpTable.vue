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
  selectedId: {
    type: String,
    default: '',
  },
  page: {
    type: Number,
    default: 1,
  },
  pageCount: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 25,
  },
  total: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits([
  'refresh',
  'toggle-watch',
  'select',
  'page-change',
  'page-size-change',
]);

const hasResults = computed(() => props.items.length > 0);

function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatDays(days) {
  if (days == null) return '—';
  if (days < 0) return `${Math.abs(days)}d late`;
  return days === 0 ? 'Due today' : `${days}d`;
}

function risk(item) {
  if (item.daysRemaining == null) {
    return { label: 'No due date', className: 'warn' };
  }
  if (item.daysRemaining < 0) {
    return { label: 'Past due', className: 'danger' };
  }
  if (item.daysRemaining <= 3) {
    return { label: 'Critical', className: 'danger' };
  }
  if (item.daysRemaining <= 10) {
    return { label: 'Watch', className: 'warn' };
  }
  return { label: 'On track', className: 'good' };
}

function location(item) {
  const city = item.billed_entity_city || '';
  const state = item.state || item.billed_entity_state || '';
  return [city, state].filter(Boolean).join(', ') || '—';
}
</script>

<template>
  <section class="table-wrap">
    <header class="table-header">
      <div>
        <p class="eyebrow">Deadline radar</p>
        <h2>Competitive bidding windows at a glance</h2>
        <p class="sub">
          {{ loading ? 'Fetching latest filings...' : 'Sorted newest to oldest' }}
        </p>
      </div>
      <div class="actions">
        <button class="ghost" :disabled="loading" @click="emit('refresh')">
          Refresh
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading">
      <div class="spinner" aria-label="Loading" />
      <span>Loading Form 470 data…</span>
    </div>

    <div v-else-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
      <button class="primary" @click="emit('refresh')">Try again</button>
    </div>

    <div v-else-if="!hasResults" class="empty">
      <p>No Form 470 filings match your filters.</p>
      <p class="hint">Try a different state, year, or clear the search.</p>
    </div>

    <div v-else class="table-scroller">
      <table>
        <thead>
          <tr>
            <th>Save</th>
            <th>Application #</th>
            <th>Applicant</th>
            <th>Location</th>
            <th>Category</th>
            <th>Posted</th>
            <th>Allowable contract date</th>
            <th>Days</th>
            <th>Risk</th>
            <th>Docs</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in props.items"
            :key="item.id"
            :class="{
              urgent: item.closingSoon,
              overdue: item.daysRemaining != null && item.daysRemaining < 0,
              selected: props.selectedId === item.id,
            }"
          >
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
            <td class="strong">
              <div class="id-row">
                <a
                  v-if="item.form_pdf?.url"
                  :href="item.form_pdf.url"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ item.application_number || '—' }}
                </a>
                <span v-else>{{ item.application_number || '—' }}</span>
                <span v-if="item.isNew" class="pill new">New</span>
              </div>
              <div class="muted smaller">
                {{ item.service_type || item.function || 'Service detail unavailable' }}
              </div>
            </td>
            <td>
              <div class="primary-text">{{ item.billed_entity_name || '—' }}</div>
              <div class="muted">{{ item.applicant_type || '—' }}</div>
            </td>
            <td>{{ location(item) }}</td>
            <td>{{ item.service_category || '—' }}</td>
            <td>{{ formatDate(item.postedDate || item.certified_date_time) }}</td>
            <td>{{ formatDate(item.dueDate || item.allowable_contract_date) }}</td>
            <td>
              <div
                class="pill"
                :class="[
                  item.closingSoon ? 'soon' : '',
                  item.daysRemaining != null && item.daysRemaining < 0 ? 'warn' : '',
                ]"
              >
                {{ formatDays(item.daysRemaining) }}
              </div>
            </td>
            <td>
              <span class="badge" :class="risk(item).className">
                {{ risk(item).label }}
              </span>
            </td>
            <td>
              <a
                v-if="item.form_pdf?.url"
                class="doc-link"
                :href="item.form_pdf.url"
                target="_blank"
                rel="noreferrer"
              >
                PDF
              </a>
              <span v-else class="muted">—</span>
            </td>
            <td>
              <button class="ghost small" @click="emit('select', item)">
                {{ props.selectedId === item.id ? 'Selected' : 'View' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <footer class="pager">
        <div class="pager-left">
          <span class="muted">Showing page {{ page }} of {{ pageCount }} • {{ total }} items</span>
        </div>
        <div class="pager-right">
          <label>
            Page size:
            <select :value="pageSize" @change="(e) => emit('page-size-change', Number(e.target.value))">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </label>
          <button class="ghost small" :disabled="page <= 1" @click="emit('page-change', page - 1)">
            Prev
          </button>
          <button
            class="ghost small"
            :disabled="page >= pageCount"
            @click="emit('page-change', page + 1)"
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.table-wrap {
  padding: 12px;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.table-header h2 {
  margin: 0;
}

.sub {
  margin: 2px 0 0;
  color: #475569;
}

.actions button {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-weight: 600;
  cursor: pointer;
}

.table-scroller {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

th {
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 1;
  font-size: 13px;
  color: #475569;
}

tbody tr:hover {
  background: #f8fafc;
}

tbody tr.urgent {
  background: #fffdf2;
}

tbody tr.overdue {
  background: #fff6f6;
}

.loading,
.error,
.empty {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
}

.error button,
.actions button.primary,
button.primary {
  background: #2563eb;
  color: #fff;
  border: 1px solid #1d4ed8;
}

.empty .hint {
  color: #475569;
  margin-left: 8px;
}

.icon-btn {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  background: #fff;
  cursor: pointer;
  font-size: 18px;
}

.icon-btn[aria-pressed='true'] {
  color: #f59e0b;
  border-color: #fcd34d;
  background: #fffbeb;
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

.muted.smaller {
  font-size: 12px;
}

.id-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-weight: 700;
  color: #0f172a;
  background: #fff;
}

tr.selected {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
  background: #eef2ff;
}

button.small {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-weight: 600;
  cursor: pointer;
}

.pager {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 4px 4px;
  flex-wrap: wrap;
}

.pager select {
  margin-left: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
}
</style>
