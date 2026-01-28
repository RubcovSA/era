import axios from 'axios';

const FORM470_API = 'https://opendata.usac.org/resource/jt8s-3q52.json';
const APP_TOKEN = import.meta.env.VITE_USAC_APP_TOKEN;

export async function fetchForm470(filters = {}) {
  const params = {
    $limit: filters.limit ?? 250,
    $order: 'certified_date_time DESC',
  };

  const whereClauses = ["fcc_form_470_status='Certified'"];

  if (filters.stateCode) {
    params.billed_entity_state = filters.stateCode;
  }
  if (filters.fundingYear) {
    params.funding_year = filters.fundingYear;
  }
  if (filters.serviceCategory) {
    params.service_category = filters.serviceCategory;
  }
  if (filters.serviceType) {
    params.service_type = filters.serviceType;
  }
  if (filters.applicantType) {
    params.applicant_type = filters.applicantType;
  }
  const windowDays = Number(filters.windowDays || 120);
  if (!Number.isNaN(windowDays) && windowDays > 0) {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - windowDays);
    whereClauses.push(`certified_date_time >= '${toSocrataDate(from)}'`);
  }
  whereClauses.push('allowable_contract_date IS NOT NULL');
  if (filters.hasRfpDocs) {
    whereClauses.push('rfp_documents.url IS NOT NULL');
  }
  if (filters.hasRestrictions) {
    whereClauses.push('state_or_local_restrictions = true');
  }

  if (whereClauses.length) {
    params.$where = whereClauses.join(' AND ');
  }

  const headers = APP_TOKEN ? { 'X-App-Token': APP_TOKEN } : undefined;
  const { data } = await axios.get(FORM470_API, { params, headers });
  return data;
}

function toSocrataDate(date) {
  // Socrata expects no trailing Z; keep milliseconds.
  return date.toISOString().replace('Z', '');
}
