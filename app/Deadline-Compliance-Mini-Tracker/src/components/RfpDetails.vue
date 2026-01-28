<script setup>
import { computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const serviceRange = computed(() => {
  if (props.item.minCapacity && props.item.maxCapacity) {
    return `${formatMbps(props.item.minCapacity)} – ${formatMbps(props.item.maxCapacity)}`;
  }
  if (props.item.minCapacity) return `${formatMbps(props.item.minCapacity)}+`;
  if (props.item.maxCapacity) return `Up to ${formatMbps(props.item.maxCapacity)}`;
  return '—';
});

function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPhone(value) {
  return value || '—';
}

function formatMbps(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  if (num >= 1000) return `${(num / 1000).toFixed(1)} Gbps`;
  return `${num} Mbps`;
}

function consultingFirm(raw) {
  if (!raw) return '—';
  // Raw format: {Firm|ID|Phone|Email}
  const cleaned = raw.replace(/[{}]/g, '');
  const [name, id, phone, email] = cleaned.split('|');
  return [name, phone, email].filter(Boolean).join(' • ');
}

function withProtocol(url) {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  return `https://${url}`;
}
</script>

<template>
  <section class="detail">
    <header class="detail-header">
      <div>
        <p class="eyebrow">Detail</p>
        <h2>{{ item.form_nickname || item.billed_entity_name || 'Form 470' }}</h2>
        <p class="sub">
          Application #{{ item.application_number || '—' }} · Funding Year
          {{ item.funding_year || '—' }} · {{ item.service_category || '—' }}
        </p>
      </div>
      <div class="cta">
        <a v-if="item.form_pdf?.url" class="btn primary" :href="item.form_pdf.url" target="_blank" rel="noreferrer">
          Open Form PDF
        </a>
        <a
          v-if="item.rfp_documents?.url"
          class="btn"
          :href="item.rfp_documents.url"
          target="_blank"
          rel="noreferrer"
        >
          RFP Docs
        </a>
        <a v-if="item.website_url" class="btn ghost" :href="withProtocol(item.website_url)" target="_blank" rel="noreferrer">
          Website
        </a>
      </div>
    </header>

    <div class="grid">
      <div class="card-ish">
        <h3>Dates</h3>
        <p><strong>Certified:</strong> {{ formatDate(item.certified_date_time || item.postedDate) }}</p>
        <p><strong>Allowable contract date:</strong> {{ formatDate(item.allowable_contract_date || item.dueDate) }}</p>
        <p>
          <strong>Days remaining:</strong>
          <span class="pill" :class="item.daysRemaining < 0 ? 'warn' : item.closingSoon ? 'soon' : ''">
            {{ item.daysRemaining != null ? item.daysRemaining : '—' }}
          </span>
        </p>
      </div>

      <div class="card-ish">
        <h3>Service</h3>
        <p><strong>Type:</strong> {{ item.service_type || item.function || '—' }}</p>
        <p><strong>Function:</strong> {{ item.function || '—' }}</p>
        <p><strong>Capacity:</strong> {{ serviceRange }}</p>
        <p><strong>Entities:</strong> {{ item.entitiesNum ?? item.entities ?? '—' }}</p>
      </div>

      <div class="card-ish">
        <h3>Applicant</h3>
        <p><strong>Name:</strong> {{ item.billed_entity_name || '—' }}</p>
        <p><strong>Type:</strong> {{ item.applicant_type || '—' }}</p>
        <p>
          <strong>Location:</strong>
          {{ item.billed_entity_city || '—' }}, {{ item.billed_entity_state || '—' }}
          {{ item.billed_entity_zip || '' }}
        </p>
        <p><strong>Email:</strong> <a v-if="item.billed_entity_email" :href="`mailto:${item.billed_entity_email}`">{{ item.billed_entity_email }}</a><span v-else>—</span></p>
        <p><strong>Phone:</strong> {{ formatPhone(item.billed_entity_phone) }}</p>
      </div>

      <div class="card-ish">
        <h3>Contacts</h3>
        <p><strong>Contact:</strong> {{ item.contact_name || '—' }}</p>
        <p><strong>Contact email:</strong> <a v-if="item.contact_email" :href="`mailto:${item.contact_email}`">{{ item.contact_email }}</a><span v-else>—</span></p>
        <p><strong>Contact phone:</strong> {{ formatPhone(item.contact_phone) }}</p>
        <p><strong>Authorized:</strong> {{ item.authorized_person_name || '—' }}</p>
        <p><strong>Authorized email:</strong> <a v-if="item.authorized_person_email" :href="`mailto:${item.authorized_person_email}`">{{ item.authorized_person_email }}</a><span v-else>—</span></p>
      </div>

      <div class="card-ish">
        <h3>Rules & RFP</h3>
        <p><strong>RFP identifier:</strong> {{ item.rfp_identifier === true ? 'Yes' : 'No/unspecified' }}</p>
        <p><strong>Restrictions:</strong> {{ item.hasRestrictions ? 'Yes' : 'No/unspecified' }}</p>
        <p class="muted">{{ item.state_or_local_restrictions_1 || 'No restriction notes provided.' }}</p>
      </div>

      <div class="card-ish">
        <h3>Consulting firm</h3>
        <p>{{ consultingFirm(item.consulting_firm_data) }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}

.detail-header h2 {
  margin: 4px 0 2px;
}

.sub {
  margin: 0;
  color: #475569;
}

.cta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  border-radius: 8px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none;
}

.btn.primary {
  background: #2563eb;
  border-color: #1d4ed8;
  color: #fff;
}

.btn.ghost {
  background: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.card-ish {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  background: #f8fafc;
}

h3 {
  margin-top: 0;
  margin-bottom: 8px;
}

p {
  margin: 4px 0;
}

.muted {
  color: #475569;
}
</style>
