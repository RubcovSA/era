import axios from 'axios';

const FORM470_API = 'https://opendata.usac.org/resource/jt8s-3q52.json';
const APP_TOKEN = import.meta.env.VITE_USAC_APP_TOKEN;

export async function fetchForm470(filters = {}) {
  const params = {
    $limit: filters.limit ?? 200,
    $order: 'certified_date_time DESC',
  };

  if (filters.stateCode) {
    params.billed_entity_state = filters.stateCode;
  }
  if (filters.fundingYear) {
    params.funding_year = filters.fundingYear;
  }
  if (filters.serviceCategory) {
    params.service_category = filters.serviceCategory;
  }

  const headers = APP_TOKEN ? { 'X-App-Token': APP_TOKEN } : undefined;
  const { data } = await axios.get(FORM470_API, { params, headers });
  return data;
}
