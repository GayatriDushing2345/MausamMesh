import {
  LocationHierarchy,
  PanchayatForecastResponse,
  MapGeoJSONResponse,
  ModelReliabilityResponse,
  AdvisoryResponse,
  ComparisonResponse,
  DAMUApprovalResponse,
  PriorityQueueResponse,
  PriorityConfigResponse,
  LocationTreeNode,
  LocationSearchItem,
  DataHealthResponse,
  BlockForecastUploadResponse
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

// Priority Queue API Callers
export async function fetchPriorityQueue(
  blockId?: string,
  districtId?: string,
  leadDay: number = 1,
  hazard: string = 'all',
  crop: string = 'all',
  weights?: Record<string, number>
): Promise<PriorityQueueResponse> {
  const params = new URLSearchParams();
  if (blockId) params.append('block_id', blockId);
  if (districtId) params.append('district_id', districtId);
  params.append('lead_day', String(leadDay));
  if (hazard && hazard !== 'all') params.append('hazard', hazard);
  if (crop && crop !== 'all') params.append('crop', crop);
  if (weights) {
    const weightsStr = Object.entries(weights).map(([k, v]) => `${k}=${v}`).join(',');
    params.append('weights', weightsStr);
  }

  const res = await fetch(`${API_BASE}/v1/priority-queue?${params.toString()}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to fetch priority queue');
  }
  return res.json();
}

export async function fetchPriorityConfig(): Promise<PriorityConfigResponse> {
  const res = await fetch(`${API_BASE}/v1/priority-queue/config`);
  if (!res.ok) throw new Error('Failed to fetch priority config');
  return res.json();
}

export function getPriorityCsvExportUrl(
  blockId?: string,
  districtId?: string,
  leadDay: number = 1,
  hazard: string = 'all',
  crop: string = 'all',
  weights?: Record<string, number>
): string {
  const params = new URLSearchParams();
  if (blockId) params.append('block_id', blockId);
  if (districtId) params.append('district_id', districtId);
  params.append('lead_day', String(leadDay));
  if (hazard && hazard !== 'all') params.append('hazard', hazard);
  if (crop && crop !== 'all') params.append('crop', crop);
  if (weights) {
    const weightsStr = Object.entries(weights).map(([k, v]) => `${k}=${v}`).join(',');
    params.append('weights', weightsStr);
  }
  return `${API_BASE}/v1/priority-queue/export.csv?${params.toString()}`;
}

// --- ROUND 4A & 4B API Methods ---
export async function fetchLocationTree(level: 'state' | 'district' | 'block' | 'panchayat' = 'state', parentId?: string): Promise<LocationTreeNode[]> {
  const params = new URLSearchParams({ level });
  if (parentId) params.append('parent_id', parentId);
  const res = await fetch(`${API_BASE}/locations/tree?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch location tree');
  return res.json();
}

export async function searchLocations(q: string, lang: string = 'en'): Promise<LocationSearchItem[]> {
  const params = new URLSearchParams({ q, lang });
  const res = await fetch(`${API_BASE}/locations/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to search locations');
  return res.json();
}

export async function fetchNearestLocation(lat: number, lon: number): Promise<LocationSearchItem | null> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  const res = await fetch(`${API_BASE}/locations/nearest?${params.toString()}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchDataHealth(): Promise<DataHealthResponse> {
  const res = await fetch(`${API_BASE}/system/data-health`);
  if (!res.ok) throw new Error('Failed to fetch data health');
  return res.json();
}

export async function uploadBlockForecastCSV(csvContent: string, dryRun: boolean = false): Promise<BlockForecastUploadResponse> {
  const res = await fetch(`${API_BASE}/block-forecast/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv_content: csvContent, dry_run: dryRun })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload CSV');
  }
  return res.json();
}

