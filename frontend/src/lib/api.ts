import {
  LocationHierarchy,
  PanchayatForecastResponse,
  MapGeoJSONResponse,
  ModelReliabilityResponse,
  AdvisoryResponse,
  ComparisonResponse,
  DAMUApprovalResponse
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function fetchLocations(): Promise<LocationHierarchy> {
  const res = await fetch(`${API_BASE}/locations`);
  if (!res.ok) throw new Error('Failed to fetch location hierarchy');
  return res.json();
}

export async function fetchPanchayatForecast(panchayatId: string): Promise<PanchayatForecastResponse> {
  const res = await fetch(`${API_BASE}/panchayats/${panchayatId}/forecast`);
  if (!res.ok) throw new Error(`Failed to fetch forecast for ${panchayatId}`);
  return res.json();
}

export async function fetchPanchayatMap(panchayatId: string): Promise<MapGeoJSONResponse> {
  const res = await fetch(`${API_BASE}/panchayats/${panchayatId}/map`);
  if (!res.ok) throw new Error(`Failed to fetch map data for ${panchayatId}`);
  return res.json();
}

export async function fetchPanchayatComparison(panchayatId: string): Promise<ComparisonResponse> {
  const res = await fetch(`${API_BASE}/panchayats/${panchayatId}/compare`);
  if (!res.ok) throw new Error(`Failed to fetch baseline vs model comparison for ${panchayatId}`);
  return res.json();
}

export async function fetchPanchayatReliability(panchayatId: string): Promise<ModelReliabilityResponse> {
  const res = await fetch(`${API_BASE}/panchayats/${panchayatId}/reliability`);
  if (!res.ok) throw new Error(`Failed to fetch reliability metrics for ${panchayatId}`);
  return res.json();
}

export async function fetchAdvisory(panchayatId: string, cropName: string, growthStage: string): Promise<AdvisoryResponse> {
  const res = await fetch(`${API_BASE}/advisory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      panchayat_id: panchayatId,
      crop_name: cropName,
      growth_stage: growthStage
    })
  });
  if (!res.ok) throw new Error('Failed to generate agro-advisory');
  return res.json();
}

export async function approveAdvisoryByDAMUOfficer(
  panchayatId: string,
  cropName: string,
  growthStage: string,
  officerName: string,
  targetChannels: string[]
): Promise<DAMUApprovalResponse> {
  const res = await fetch(`${API_BASE}/advisory/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      panchayat_id: panchayatId,
      crop_name: cropName,
      growth_stage: growthStage,
      officer_name: officerName,
      target_channels: targetChannels
    })
  });
  if (!res.ok) throw new Error('Failed to approve advisory bulletin');
  return res.json();
}

export function getReportDownloadUrl(panchayatId: string, cropName: string = 'Cotton', lang: string = 'en'): string {
  return `${API_BASE}/panchayats/${panchayatId}/report?crop=${encodeURIComponent(cropName)}&lang=${encodeURIComponent(lang)}`;
}
