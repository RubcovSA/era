<script setup lang="ts">
import type { RfpRecord } from '../types/erate'

const props = defineProps<{
  rfps: RfpRecord[]
  loading: boolean
  error: string | null
}>()

function formatDate(value?: string) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(date?: string) {
  if (!date) return null
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  const diff = d.getTime() - Date.now()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function urgencyBadge(date?: string) {
  const days = daysUntil(date)
  if (days === null) return null
  if (days < 0) return { label: 'Closed', tone: 'red' }
  if (days <= 7) return { label: `${days} days left`, tone: 'amber' }
  return { label: `${days} days left`, tone: 'emerald' }
}
</script>

<template>
  <div>
    <div class="card-header">
      <div>
        <span v-if="loading">Talking to USAC… pulling live Form 470s.</span>
        <span v-else>Showing {{ rfps.length }} opportunities</span>
      </div>
      <div v-if="!loading && rfps.length === 0 && !error">
        <span style="font-size: 11px; color: #6b7280;">
          No Form 470s matched these filters. Try another state or funding year.
        </span>
      </div>
    </div>

    <div
      v-if="error"
      style="border-bottom: 1px solid rgba(30, 64, 175, 0.7); padding: 8px 16px; font-size: 11px; color: #fecaca; background: rgba(127, 29, 29, 0.35);"
    >
      <p style="font-weight: 500; margin: 0 0 2px 0;">We couldn’t reach USAC just now.</p>
      <p style="margin: 0;">Check your network or dataset ID in <code>src/api/usac.ts</code>, then refresh.</p>
    </div>

    <div style="max-height: 480px; overflow: auto; font-size: 12px;">
      <table class="rfp-table">
        <thead>
          <tr>
            <th>Applicant</th>
            <th>State</th>
            <th>Posted</th>
            <th>Due / ACD</th>
            <th>Category</th>
            <th>Summary</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="rfp in rfps"
            :key="rfp.id"
            class="rfp-row"
          >
            <td class="rfp-cell">
              <div class="rfp-applicant">
                {{ rfp.applicantName }}
              </div>
              <a
                v-if="rfp.url"
                :href="rfp.url"
                target="_blank"
                rel="noreferrer"
                class="rfp-link"
              >
                View RFP
              </a>
            </td>
            <td class="rfp-cell">
              {{ rfp.state || '—' }}
            </td>
            <td class="rfp-cell">
              {{ formatDate(rfp.postingDate) }}
            </td>
            <td class="rfp-cell">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <span>{{ formatDate(rfp.dueDate) }}</span>
                <span
                  v-if="urgencyBadge(rfp.dueDate)"
                  class="badge"
                  :class="{
                    'badge-urgent': urgencyBadge(rfp.dueDate)?.tone === 'red',
                    'badge-soon': urgencyBadge(rfp.dueDate)?.tone === 'amber',
                    'badge-normal': urgencyBadge(rfp.dueDate)?.tone === 'emerald',
                  }"
                >
                  {{ urgencyBadge(rfp.dueDate)?.label }}
                </span>
              </div>
            </td>
            <td class="rfp-cell">
              {{ rfp.category || '—' }}
            </td>
            <td class="rfp-cell">
              {{ rfp.shortDescription || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

