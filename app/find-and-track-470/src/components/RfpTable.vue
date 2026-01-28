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
        <h2>Results</h2>
        <p class="sub">
          {{ loading ? 'Fetching latest filings...' : 'Showing recent Form 470 filings' }}
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
            <th>State</th>
            <th>Category</th>
            <th>Service type</th>
            <th>Posted</th>
            <th>Due</th>
            <th>Days</th>
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
            <td class="strong">
              <a
                v-if="item.form_pdf?.url"
                :href="item.form_pdf.url"
                target="_blank"
                rel="noreferrer"
              >
                {{ item.application_number || '—' }}
              </a>
              <span v-else>{{ item.application_number || '—' }}</span>
              <div v-if="item.isNew" class="pill new">New</div>
            </td>
            <td>
              <div class="primary-text">{{ item.billed_entity_name || '—' }}</div>
              <div class="muted">
                {{ item.billed_entity_city || '—' }}
              </div>
            </td>
            <td>{{ item.state || '—' }}</td>
            <td>{{ item.service_category || '—' }}</td>
            <td>{{ item.service_type || item.function || '—' }}</td>
            <td>{{ formatDate(item.postedDate || item.certified_date_time) }}</td>
            <td>{{ formatDate(item.dueDate || item.allowable_contract_date) }}</td>
            <td>
              <div class="pill" :class="item.closingSoon ? 'soon' : ''">
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
</style>
